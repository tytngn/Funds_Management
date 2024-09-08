package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.request.PermissionRequest;
import com.tytngn.fundsmanagement.dto.response.PermissionResponse;
import com.tytngn.fundsmanagement.service.PermissionService;
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
@RequestMapping("/permissions")
public class PermissionController {

    PermissionService permissionService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_PERMISSION'})")
    ApiResponse<PermissionResponse> createPermission(@RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .code(1000)
                .result(permissionService.createPermission(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_PERMISSION'})")
    ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .code(1000)
                .result(permissionService.getAllPermissions())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_PERMISSION'})")
    ApiResponse<PermissionResponse> updatePermission(@RequestParam String id, @RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .code(1000)
                .result(permissionService.updatePermission(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_PERMISSION'})")
    ApiResponse<Void> deletePermission(@RequestParam String id) {
        permissionService.deletePermission(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
