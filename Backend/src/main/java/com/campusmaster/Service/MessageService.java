package com.campusmaster.Service;

import com.campusmaster.DAO.*;
import com.campusmaster.Entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private ConversationDAO conversationDAO;

    @Autowired
    private MessageDAO messageDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private CourseEnrollmentDAO courseEnrollmentDAO;

    @Autowired
    private NotificationService notificationService;

    public List<Conversation> getConversations(String userEmail) {
        List<Conversation> conversations = conversationDAO.findByParticipantEmail(userEmail);

        for (Conversation conv : conversations) {
            messageDAO.findLastMessageByConversationId(conv.getId())
                    .ifPresent(conv::setLastMessage);
            conv.setUnreadCount(messageDAO.countUnreadInConversation(conv.getId(), userEmail));
        }

        return conversations;
    }

    public List<Message> getMessages(Long conversationId, String userEmail) {
        Conversation conversation = conversationDAO.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getParticipant1().getUserEmail().equals(userEmail) &&
            !conversation.getParticipant2().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You are not a participant of this conversation");
        }

        return messageDAO.findByConversationId(conversationId);
    }

    @Transactional
    public Message sendMessage(String senderEmail, String recipientEmail, String content) {
        if (senderEmail.equals(recipientEmail)) {
            throw new RuntimeException("Cannot send a message to yourself");
        }

        User sender = userDAO.findByUserEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userDAO.findByUserEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Validate that sender and recipient have a course relationship
        validateCourseRelationship(sender, recipient);

        // Get or create conversation
        Conversation conversation = conversationDAO.findByParticipants(senderEmail, recipientEmail)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setParticipant1(sender);
                    newConv.setParticipant2(recipient);
                    return conversationDAO.save(newConv);
                });

        // Create message
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setIsRead(false);
        Message savedMessage = messageDAO.save(message);

        // Update conversation's lastMessageAt
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationDAO.save(conversation);

        // Send notification
        notificationService.createNotification(
                recipient,
                NotificationType.NEW_MESSAGE,
                "New message from " + sender.getUserFirstName() + " " + sender.getUserLastName(),
                content.length() > 100 ? content.substring(0, 100) + "..." : content,
                "CONVERSATION",
                conversation.getId()
        );

        return savedMessage;
    }

    @Transactional
    public void markAsRead(Long conversationId, String userEmail) {
        Conversation conversation = conversationDAO.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getParticipant1().getUserEmail().equals(userEmail) &&
            !conversation.getParticipant2().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You are not a participant of this conversation");
        }

        messageDAO.markAsReadInConversation(conversationId, userEmail);
    }

    public Long getUnreadCount(String userEmail) {
        return messageDAO.countTotalUnread(userEmail);
    }

    /**
     * Get contacts the user can message.
     * Students can message teachers of courses they're enrolled in.
     * Teachers can message students enrolled in their courses.
     */
    public List<User> getContacts(String userEmail) {
        User user = userDAO.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> contactEmails = new HashSet<>();
        List<User> contacts = new ArrayList<>();

        boolean isTeacher = user.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("Teacher"));
        boolean isStudent = user.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("User"));

        if (isTeacher) {
            // Teachers can message students enrolled in their courses
            List<Course> teacherCourses = courseDAO.findByTeacherEmail(userEmail);
            for (Course course : teacherCourses) {
                List<CourseEnrollment> enrollments = courseEnrollmentDAO.findByCourseId(course.getId());
                for (CourseEnrollment enrollment : enrollments) {
                    String studentEmail = enrollment.getStudent().getUserEmail();
                    if (!contactEmails.contains(studentEmail)) {
                        contactEmails.add(studentEmail);
                        contacts.add(enrollment.getStudent());
                    }
                }
            }
        }

        if (isStudent) {
            // Students can message teachers of courses they're enrolled in
            List<CourseEnrollment> enrollments = courseEnrollmentDAO.findByStudentEmail(userEmail);
            for (CourseEnrollment enrollment : enrollments) {
                User teacher = enrollment.getCourse().getTeacher();
                if (teacher != null && !contactEmails.contains(teacher.getUserEmail())) {
                    contactEmails.add(teacher.getUserEmail());
                    contacts.add(teacher);
                }
            }
        }

        return contacts;
    }

    private void validateCourseRelationship(User sender, User recipient) {
        boolean senderIsTeacher = sender.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("Teacher"));
        boolean senderIsStudent = sender.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("User"));
        boolean recipientIsTeacher = recipient.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("Teacher"));
        boolean recipientIsStudent = recipient.getRole().stream()
                .anyMatch(r -> r.getRoleName().equals("User"));

        boolean hasRelationship = false;

        if (senderIsStudent && recipientIsTeacher) {
            // Check if student is enrolled in any course taught by this teacher
            List<Course> teacherCourses = courseDAO.findByTeacherEmail(recipient.getUserEmail());
            for (Course course : teacherCourses) {
                if (courseEnrollmentDAO.existsByCourseIdAndStudentUserEmail(course.getId(), sender.getUserEmail())) {
                    hasRelationship = true;
                    break;
                }
            }
        } else if (senderIsTeacher && recipientIsStudent) {
            // Check if student is enrolled in any course taught by this teacher
            List<Course> teacherCourses = courseDAO.findByTeacherEmail(sender.getUserEmail());
            for (Course course : teacherCourses) {
                if (courseEnrollmentDAO.existsByCourseIdAndStudentUserEmail(course.getId(), recipient.getUserEmail())) {
                    hasRelationship = true;
                    break;
                }
            }
        }

        if (!hasRelationship) {
            throw new RuntimeException("You can only message users you share a course with");
        }
    }
}
