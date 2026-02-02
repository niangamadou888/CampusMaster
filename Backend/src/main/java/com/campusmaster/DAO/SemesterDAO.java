package com.campusmaster.DAO;

import com.campusmaster.Entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterDAO extends JpaRepository<Semester, Long> {
    List<Semester> findByYear(Integer year);
    Optional<Semester> findByIsActiveTrue();

    @Query("SELECT s FROM Semester s ORDER BY s.year DESC, s.name DESC")
    List<Semester> findAllOrderByYearDesc();

    @Query("SELECT s FROM Semester s WHERE s.year = :year AND s.name = :name")
    Optional<Semester> findByYearAndName(Integer year, String name);
}
