package com.campusmaster.Service;

import com.campusmaster.DAO.CourseDAO;
import com.campusmaster.DAO.CourseEnrollmentDAO;
import com.campusmaster.DAO.SubjectDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.CourseEnrollment;
import com.campusmaster.Entity.Subject;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private SubjectDAO subjectDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CourseEnrollmentDAO enrollmentDAO;

    public List<Course> getAllCourses() {
        return courseDAO.findAll();
    }

    public List<Course> getPublishedCourses() {
        return courseDAO.findPublishedCoursesOrderByDate();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseDAO.findById(id);
    }

    public List<Course> getCoursesByTeacher(String teacherEmail) {
        return courseDAO.findByTeacherEmail(teacherEmail);
    }

    public List<Course> getCoursesBySubject(Long subjectId) {
        return courseDAO.findBySubjectId(subjectId);
    }

    public List<Course> getCoursesByDepartment(Long departmentId) {
        return courseDAO.findPublishedByDepartment(departmentId);
    }

    public List<Course> getCoursesBySemester(Long semesterId) {
        return courseDAO.findPublishedBySemester(semesterId);
    }

    public List<Course> searchCourses(String keyword) {
        return courseDAO.searchByTitle(keyword);
    }

    public Course createCourse(Course course, Long subjectId, String teacherEmail) {
        Subject subject = subjectDAO.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));

        User teacher = userDAO.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

        course.setSubject(subject);
        course.setTeacher(teacher);
        course.setIsPublished(false);

        return courseDAO.save(course);
    }

    public Course updateCourse(Long id, Course updatedCourse, String teacherEmail) {
        Course course = courseDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Verify the teacher owns this course
        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to update this course");
        }

        if (updatedCourse.getTitle() != null) {
            course.setTitle(updatedCourse.getTitle());
        }
        if (updatedCourse.getDescription() != null) {
            course.setDescription(updatedCourse.getDescription());
        }

        return courseDAO.save(course);
    }

    public Course publishCourse(Long id, String teacherEmail) {
        Course course = courseDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to publish this course");
        }

        course.setIsPublished(true);
        return courseDAO.save(course);
    }

    public Course unpublishCourse(Long id, String teacherEmail) {
        Course course = courseDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to unpublish this course");
        }

        course.setIsPublished(false);
        return courseDAO.save(course);
    }

    public void deleteCourse(Long id, String teacherEmail) {
        Course course = courseDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to delete this course");
        }

        courseDAO.deleteById(id);
    }

    // Enrollment methods
    public CourseEnrollment enrollStudent(Long courseId, String studentEmail) {
        Course course = courseDAO.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (!course.getIsPublished()) {
            throw new RuntimeException("Cannot enroll in unpublished course");
        }

        User student = userDAO.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + studentEmail));

        if (enrollmentDAO.existsByCourseIdAndStudentUserEmail(courseId, studentEmail)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollment.setStatus(CourseEnrollment.EnrollmentStatus.ACTIVE);

        return enrollmentDAO.save(enrollment);
    }

    public void unenrollStudent(Long courseId, String studentEmail) {
        CourseEnrollment enrollment = enrollmentDAO.findByCourseIdAndStudentEmail(courseId, studentEmail)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setStatus(CourseEnrollment.EnrollmentStatus.DROPPED);
        enrollmentDAO.save(enrollment);
    }

    public List<CourseEnrollment> getEnrolledStudents(Long courseId) {
        return enrollmentDAO.findByCourseId(courseId);
    }

    public List<CourseEnrollment> getStudentEnrollments(String studentEmail) {
        return enrollmentDAO.findActiveEnrollmentsByStudent(studentEmail);
    }

    public boolean isStudentEnrolled(Long courseId, String studentEmail) {
        return enrollmentDAO.existsByCourseIdAndStudentUserEmail(courseId, studentEmail);
    }

    public Long getEnrollmentCount(Long courseId) {
        return enrollmentDAO.countActiveEnrollmentsByCourse(courseId);
    }
}
