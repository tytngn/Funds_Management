package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.DepartmentRequest;
import com.tytngn.fundsmanagement.dto.response.*;
import com.tytngn.fundsmanagement.entity.Department;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.DepartmentMapper;
import com.tytngn.fundsmanagement.mapper.UserMapper;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DepartmentService {

    DepartmentRepository departmentRepository;
    DepartmentMapper departmentMapper;
    UserMapper userMapper;
    Collator vietnameseCollator;

    // tạo phòng ban
    public DepartmentSimpleResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.DEPARTMENT_EXISTS);

        Department department = departmentMapper.toDepartment(request);

        return departmentMapper.toDepartmentSimpleResponse(departmentRepository.save(department));
    }


    // lấy danh sách tất cả phòng ban và tổng số nhân viên
    public List<DepartmentResponse> getAllDepartments() {
        var departments = departmentRepository.findAll()
                .stream()
                .map(department -> {
                    DepartmentResponse response = departmentMapper.toDepartmentResponse(department);
                    int employeeCount = (int) department.getUsers().stream()
                            .filter(user -> user.getStatus() == 1 || user.getStatus() == 9999)
                            .count(); // Lấy số nhân viên trong phòng ban
                    response.setEmployeeCount(employeeCount); // Gán số nhân viên vào response

                    // Lọc danh sách nhân viên đang hoạt động và chuyển đổi sang UserSimpleResponse
                    Set<UserSimpleResponse> activeUsers = department.getUsers().stream()
                            .filter(user -> user.getStatus() == 1 || user.getStatus() == 9999)
                            .map(userMapper::toUserSimpleResponse)
                            .collect(Collectors.toSet());
                    response.setUsers(activeUsers);

                    return response;
                })
                .sorted(Comparator.comparing(DepartmentResponse::getName, vietnameseCollator))
                .toList();

        return departments;
    }

    // lấy danh sách thủ quỹ trong từng phòng ban
    public List<DepartmentResponse> getTreasurerInDepartment() {
        var departments = departmentRepository.findAll()
                .stream()
                .map(department -> {
                    DepartmentResponse response = departmentMapper.toDepartmentResponse(department);

                    // Lọc danh sách nhân viên có role là USER_MANAGER
                    Set<UserSimpleResponse> managers = department.getUsers().stream()
                            .filter(user -> user.getRoles().stream()
                                    .anyMatch(role -> "USER_MANAGER".equalsIgnoreCase(role.getId())))
                            .map(userMapper::toUserSimpleResponse)
                            .collect(Collectors.toSet());

                    // Gán danh sách managers vào response
                    response.setUsers(managers);
                    response.setEmployeeCount(managers.size()); // Gán số lượng USER_MANAGER

                    return response;
                })
                .sorted(Comparator.comparing(DepartmentResponse::getName, vietnameseCollator))
                .toList();

        return departments;
    }

    // lấy thông tin phòng ban theo ID
    public DepartmentResponse getDepartmentById(String id) {
        return departmentMapper.toDepartmentResponse(departmentRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS)));
    }


    // cập nhật phòng ban
    public DepartmentSimpleResponse updateDepartment(String id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));

        departmentMapper.updateDepartment(department, request);

        return departmentMapper.toDepartmentSimpleResponse(departmentRepository.save(department));
    }


    // xoá phòng ban
    public void deleteDepartment(String id) {
        var department = departmentRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));

        var users = department.getUsers();

        // Kiểm tra xem phòng ban có nhân viên hay không
        if (!users.isEmpty()) {
            throw new AppException(ErrorCode.DEPARTMENT_NOT_EMPTY);
        }

        // Nếu không có nhân viên, thực hiện xoá phòng ban
        departmentRepository.deleteById(id);
    }
}
