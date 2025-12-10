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

    public User registerNewUser(User user) {
        Role role = roleDao.findById("User").get();

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRole(roles);

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

        User adminUser = new User();
        adminUser.setUserFirstName("admin");
        adminUser.setUserLastName("admin");
        adminUser.setUserEmail("admin@campusmaster.com");
        adminUser.setUserPassword(getEncodedPassword("C@mpusm@sterAdmin123"));
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

    public void suspendUser(String id) {
        Optional<User> userOptional = userDao.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setSuspended(true);
            userDao.save(user);
        }
    }

    public void unsuspendUser(String id) {
        Optional<User> userOptional = userDao.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setSuspended(false);
            userDao.save(user);
        }
    }

    public String getEncodedPassword(String password) {
        return passwordEncoder.encode(password);
    }

}