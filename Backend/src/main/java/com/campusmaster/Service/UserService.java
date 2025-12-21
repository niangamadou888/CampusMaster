package com.campusmaster.Service;
import com.campusmaster.DAO.RoleDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Role;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return userDao.save(user);
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
            user.setIsSuspended(false);
            userDao.save(user);
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

}