package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.DepartmentRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.DepartmentResponse;
import com.tytngn.fundsmanagement.dto.response.DepartmentSimpleResponse;
import com.tytngn.fundsmanagement.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/departments")
public class DepartmentController {

    DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_DEPARTMENT'})")
    ApiResponse<DepartmentSimpleResponse> createDepartment(@RequestBody @Valid DepartmentRequest request) {
        return ApiResponse.<DepartmentSimpleResponse>builder()
                .result(departmentService.createDepartment(request))
                .code(1000)
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_DEPARTMENT'})")
    ApiResponse<List<DepartmentResponse>> getAllDepartments() {
        return ApiResponse.<List<DepartmentResponse>>builder()
                .result(departmentService.getAllDepartments())
                .code(1000)
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_DEPARTMENT_BY_ID'})")
    ApiResponse<DepartmentResponse> getDepartmentById(@PathVariable String id) {
        return ApiResponse.<DepartmentResponse>builder()
                .result(departmentService.getDepartmentById(id))
                .code(1000)
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_DEPARTMENTS'})")
    ApiResponse<DepartmentSimpleResponse> updateDepartments(@PathVariable String id, @RequestBody @Valid DepartmentRequest request) {
        return ApiResponse.<DepartmentSimpleResponse>builder()
                .result(departmentService.updateDepartment(id, request))
                .code(1000)
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_DEPARTMENTS'})")
    ApiResponse<Void> deleteDepartments(@PathVariable String id) {
        departmentService.deleteDepartment(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }

}

