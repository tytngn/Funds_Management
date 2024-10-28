package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.DepartmentRequest;
import com.tytngn.fundsmanagement.dto.response.DepartmentResponse;
import com.tytngn.fundsmanagement.dto.response.DepartmentSimpleResponse;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
import com.tytngn.fundsmanagement.entity.Department;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.DepartmentMapper;
import com.tytngn.fundsmanagement.repository.DepartmentRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DepartmentService {

    DepartmentRepository departmentRepository;
    DepartmentMapper departmentMapper;
    UserRepository userRepository;
    Collator vietnameseCollator;

    public DepartmentSimpleResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.DEPARTMENT_EXISTS);

        Department department = departmentMapper.toDepartment(request);

        return departmentMapper.toDepartmentSimpleResponse(departmentRepository.save(department));
    }

    public List<DepartmentResponse> getAllDepartments() {
        var departments = departmentRepository.findAll()
                    .stream()
                    .map(department -> departmentMapper.toDepartmentResponse(department))
                    .sorted(Comparator.comparing(DepartmentResponse::getName, vietnameseCollator))
                    .toList();

        return departments;
    }

    public DepartmentSimpleResponse updateDepartment(String id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));

        departmentMapper.updateDepartment(department, request);

        return departmentMapper.toDepartmentSimpleResponse(departmentRepository.save(department));
    }

    public void deleteDepartment(String id) {
        var department = departmentRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));

        var users = department.getUsers();
        for (User user : users) {
            user.setDepartment(null);
        }
        userRepository.saveAll(users);
        departmentRepository.deleteById(id);
    }
}
