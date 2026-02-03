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

    // Pending = isSuspended true AND never approved (approvedAt is null)
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = 'Teacher' AND u.isSuspended = TRUE AND u.approvedAt IS NULL")
    List<User> findPendingTeachers();

    // Approved and active = not suspended (approvedAt should be set)
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = 'Teacher' AND (u.isSuspended = FALSE OR u.isSuspended IS NULL)")
    List<User> findApprovedTeachers();

    // Suspended = was approved before but now suspended (isSuspended true AND approvedAt not null)
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.roleName = 'Teacher' AND u.isSuspended = TRUE AND u.approvedAt IS NOT NULL")
    List<User> findSuspendedTeachers();
}