package com.campusmaster.DAO;

import com.campusmaster.Entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDAO extends CrudRepository<User, String> {
    Optional<User> findByUserEmail(String userEmail);
    List<User> findByResetToken(String resetToken);
}