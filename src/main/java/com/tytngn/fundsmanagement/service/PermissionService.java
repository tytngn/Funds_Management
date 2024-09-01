package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.dto.request.PermissionRequest;
import com.tytngn.fundsmanagement.dto.response.PermissionSimpleResponse;
import com.tytngn.fundsmanagement.dto.response.PermissionResponse;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.PermissionMapper;
import com.tytngn.fundsmanagement.repository.FunctionsRepository;
import com.tytngn.fundsmanagement.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionRepository permissionRepository;

    FunctionsRepository functionsRepository;

    PermissionMapper permissionMapper;

    public PermissionResponse createPermission(PermissionRequest request) {

        var permission = permissionMapper.toPermission(request);

        var functions = functionsRepository.findById(request.getFunctionsId())
                .orElseThrow(() -> new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));

        permission.setFunctions(functions);

        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAllPermissions() {
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permission -> permissionMapper.toPermissionResponse(permission)).toList();
    }

    public void deletePermission(String permissionId) {
        permissionRepository.deleteById(permissionId);
    }
}
