package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    boolean existsByName(String name);
}
