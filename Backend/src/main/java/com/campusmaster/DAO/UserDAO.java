package com.campusmaster.DAO;

import com.campusmaster.Entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDAO extends CrudRepository<User, String> {
    Optional<User> findByUserEmail(String userEmail);
    List<User> findByResetToken(String resetToken);

    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = 'Teacher' AND u.isSuspended = TRUE")
    List<User> findPendingTeachers();

    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = 'Teacher' AND (u.isSuspended = FALSE OR u.isSuspended IS NULL)")
    List<User> findApprovedTeachers();
}