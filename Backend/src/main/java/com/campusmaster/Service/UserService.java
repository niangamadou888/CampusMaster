package com.campusmaster.Service;
import com.campusmaster.DAO.RoleDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Role;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserDAO userDao;

    @Autowired
    private RoleDAO roleDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificationService notificationService;

    public User registerNewUser(User user, String roleName) {
        // Default to "User" role if not specified
        final String finalRoleName = (roleName == null || roleName.isEmpty()) ? "User" : roleName;

        Role role = roleDao.findById(finalRoleName).orElseThrow(
            () -> new RuntimeException("Role not found: " + finalRoleName)
        );

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRole(roles);

        // Auto-suspend teacher accounts until admin approval
        if ("Teacher".equals(finalRoleName)) {
            user.setIsSuspended(true);
        }

        user.setUserPassword(getEncodedPassword(user.getUserPassword()));
        User savedUser = userDao.save(user);

        // Notify admins when a new teacher registers
        if ("Teacher".equals(finalRoleName)) {
            notificationService.notifyAdminsOfPendingTeacher(savedUser);
        }

        return savedUser;
    }

    public void initRolesAndUser(){
        Role adminRole = new Role();
        adminRole.setRoleName("Admin");
        adminRole.setRoleDescription("Admin role");
        roleDao.save(adminRole);

        Role userRole = new Role();
        userRole.setRoleName("User");
        userRole.setRoleDescription("Default role for newly create record");
        roleDao.save(userRole);

        Role teacherRole = new Role();
        teacherRole.setRoleName("Teacher");
        teacherRole.setRoleDescription("Teacher role - requires admin approval");
        roleDao.save(teacherRole);

        User adminUser = new User();
        adminUser.setUserFirstName("admin");
        adminUser.setUserLastName("admin");
        adminUser.setUserEmail("admin@admin.com");
        adminUser.setUserPassword(getEncodedPassword("admin123"));
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);
        adminUser.setRole(adminRoles);
        userDao.save(adminUser);

        /*
        User user = new User();
        user.setUserFirstName("user");
        user.setUserLastName("user");
        user.setUserEmail("user@user.com");
        user.setUserPassword(getEncodedPassword("user123"));
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(userRole);
        user.setRole(userRoles);
        userDao.save(user);

         */
    }

    // Method to update user information (only firstName, lastName, and email)


    public User updateUserInfo(User updatedUser, String userEmail) {


        Optional<User> userOptional = userDao.findById(userEmail);





        if (userOptional.isPresent()) {


            User user = userOptional.get();





            // Update the fields


            if (updatedUser.getUserFirstName() != null) {


                user.setUserFirstName(updatedUser.getUserFirstName());


            }


            if (updatedUser.getUserLastName() != null) {


                user.setUserLastName(updatedUser.getUserLastName());


            }


            if (updatedUser.getUserEmail() != null) {


                user.setUserEmail(updatedUser.getUserEmail());


            }





            return userDao.save(user);


        } else {


            throw new RuntimeException("User not found with email: " + userEmail);


        }


    }

    public void suspendUser(String id) {
        Optional<User> userOptional = userDao.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsSuspended(true);
            userDao.save(user);
        }
    }

    public void unsuspendUser(String id) {
        Optional<User> userOptional = userDao.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean isTeacher = user.getRole().stream().anyMatch(r -> "Teacher".equals(r.getRoleName()));
            boolean wasTeacherPending = user.getIsSuspended() && isTeacher && user.getApprovedAt() == null;

            user.setIsSuspended(false);

            // Set approvedAt only on first approval (when it was null)
            if (isTeacher && user.getApprovedAt() == null) {
                user.setApprovedAt(LocalDateTime.now());
            }

            userDao.save(user);

            // Notify teacher when their account is approved for the first time
            if (wasTeacherPending) {
                notificationService.notifyTeacherApproved(user);
            }
        }
    }

    public String getEncodedPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public java.util.List<User> getPendingTeachers() {
        return userDao.findPendingTeachers();
    }

    public java.util.List<User> getApprovedTeachers() {
        return userDao.findApprovedTeachers();
    }

    public java.util.List<User> getSuspendedTeachers() {
        return userDao.findSuspendedTeachers();
    }

    public java.util.List<User> getAllUsers() {
        java.util.List<User> users = new java.util.ArrayList<>();
        userDao.findAll().forEach(users::add);
        return users;
    }

    /**
     * Reject a pending teacher by deleting their account.
     * Can only reject teachers that have never been approved (approvedAt is null).
     */
    public void rejectPendingTeacher(String teacherEmail) {
        Optional<User> userOptional = userDao.findById(teacherEmail);
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Verify it's a teacher
            boolean isTeacher = user.getRole().stream().anyMatch(r -> "Teacher".equals(r.getRoleName()));
            if (!isTeacher) {
                throw new RuntimeException("User is not a teacher");
            }

            // Can only reject pending teachers (never approved)
            if (user.getApprovedAt() != null) {
                throw new RuntimeException("Cannot reject an already approved teacher. Use suspend instead.");
            }

            // Delete the user
            userDao.delete(user);
        } else {
            throw new RuntimeException("User not found with email: " + teacherEmail);
        }
    }

}