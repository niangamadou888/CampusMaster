package com.campusmaster.Service;

import com.campusmaster.DAO.SemesterDAO;
import com.campusmaster.Entity.Semester;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SemesterService {

    @Autowired
    private SemesterDAO semesterDAO;

    public List<Semester> getAllSemesters() {
        return semesterDAO.findAllOrderByYearDesc();
    }

    public Optional<Semester> getSemesterById(Long id) {
        return semesterDAO.findById(id);
    }

    public List<Semester> getSemestersByYear(Integer year) {
        return semesterDAO.findByYear(year);
    }

    public Optional<Semester> getActiveSemester() {
        return semesterDAO.findByIsActiveTrue();
    }

    public Semester createSemester(Semester semester) {
        Optional<Semester> existing = semesterDAO.findByYearAndName(semester.getYear(), semester.getName());
        if (existing.isPresent()) {
            throw new RuntimeException("Semester " + semester.getName() + " " + semester.getYear() + " already exists");
        }
        return semesterDAO.save(semester);
    }

    public Semester updateSemester(Long id, Semester updatedSemester) {
        return semesterDAO.findById(id)
                .map(semester -> {
                    if (updatedSemester.getName() != null) {
                        semester.setName(updatedSemester.getName());
                    }
                    if (updatedSemester.getYear() != null) {
                        semester.setYear(updatedSemester.getYear());
                    }
                    if (updatedSemester.getStartDate() != null) {
                        semester.setStartDate(updatedSemester.getStartDate());
                    }
                    if (updatedSemester.getEndDate() != null) {
                        semester.setEndDate(updatedSemester.getEndDate());
                    }
                    return semesterDAO.save(semester);
                })
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + id));
    }

    @Transactional
    public Semester setActiveSemester(Long id) {
        // Deactivate all semesters first
        List<Semester> allSemesters = semesterDAO.findAll();
        for (Semester s : allSemesters) {
            s.setIsActive(false);
            semesterDAO.save(s);
        }

        // Activate the selected semester
        return semesterDAO.findById(id)
                .map(semester -> {
                    semester.setIsActive(true);
                    return semesterDAO.save(semester);
                })
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + id));
    }

    public void deleteSemester(Long id) {
        if (!semesterDAO.existsById(id)) {
            throw new RuntimeException("Semester not found with id: " + id);
        }
        semesterDAO.deleteById(id);
    }
}
