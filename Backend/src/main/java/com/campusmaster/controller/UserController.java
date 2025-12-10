package com.campusmaster.Controller;

import com.campusmaster.Entity.User;
import com.campusmaster.Service.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @PostConstruct
    public void initRolesAndUsers() {
        userService.initRolesAndUser();
    }

    @PostMapping({"/registerNewUser"})
    public User registerNewUser(@RequestBody User user){
        return userService.registerNewUser(user);
    }

    @GetMapping({"forAdmin"})
    @PreAuthorize("hasRole('Admin')")
    public String forAdmin(){
        return "This URL is only accessible to admin";
    }

    @GetMapping({"forUser"})
    @PreAuthorize("hasRole('User')")
    public String forUser(){
        return "This URL is only accessible to the user";
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('Admin')")
    public void suspendUser(@PathVariable String id) {
        userService.suspendUser(id);
    }

    @PutMapping("/{id}/unsuspend")
    @PreAuthorize("hasRole('Admin')")
    public void unsuspendUser(@PathVariable String id) {
        userService.unsuspendUser(id);
    }
}