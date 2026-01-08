package com.campusmaster.DAO;

import com.campusmaster.Entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentDAO extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);
    Optional<Department> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
