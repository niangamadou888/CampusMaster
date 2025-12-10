package com.campusmaster.Service;

import com.campusmaster.DAO.RoleDAO;
import com.campusmaster.Entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    @Autowired
    private RoleDAO roleDAO;

    public Role createNewRole(Role role){
        return roleDAO.save(role);
    }
}