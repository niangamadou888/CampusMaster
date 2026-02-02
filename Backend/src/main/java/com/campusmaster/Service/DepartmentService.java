package com.campusmaster.Service;

import com.campusmaster.DAO.DepartmentDAO;
import com.campusmaster.Entity.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentDAO departmentDAO;

    public List<Department> getAllDepartments() {
        return departmentDAO.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentDAO.findById(id);
    }

    public Optional<Department> getDepartmentByCode(String code) {
        return departmentDAO.findByCode(code);
    }

    public Department createDepartment(Department department) {
        if (departmentDAO.existsByCode(department.getCode())) {
            throw new RuntimeException("Department with code " + department.getCode() + " already exists");
        }
        if (departmentDAO.existsByName(department.getName())) {
            throw new RuntimeException("Department with name " + department.getName() + " already exists");
        }
        return departmentDAO.save(department);
    }

    public Department updateDepartment(Long id, Department updatedDepartment) {
        return departmentDAO.findById(id)
                .map(department -> {
                    if (updatedDepartment.getName() != null) {
                        department.setName(updatedDepartment.getName());
                    }
                    if (updatedDepartment.getCode() != null) {
                        department.setCode(updatedDepartment.getCode());
                    }
                    if (updatedDepartment.getDescription() != null) {
                        department.setDescription(updatedDepartment.getDescription());
                    }
                    return departmentDAO.save(department);
                })
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    public void deleteDepartment(Long id) {
        if (!departmentDAO.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentDAO.deleteById(id);
    }
}
