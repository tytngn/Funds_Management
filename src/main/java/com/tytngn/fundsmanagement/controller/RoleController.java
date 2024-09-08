package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.request.RoleRequest;
import com.tytngn.fundsmanagement.dto.response.RoleResponse;
import com.tytngn.fundsmanagement.service.RoleService;
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
@RequestMapping("/roles")
public class RoleController {
    RoleService roleService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_ROLE'})")
    ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .code(1000)
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_ROLE'})")
    ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAllRoles())
                .code(1000)
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_ROLE'})")
    ApiResponse<RoleResponse> updateRole(@RequestParam String id, @RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(id, request))
                .code(1000)
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_ROLE'})")
    ApiResponse<Void> deleteRole(@RequestParam String roleId) {
        roleService.deleteRole(roleId);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
