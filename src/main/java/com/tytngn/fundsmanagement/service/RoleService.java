package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.RoleRequest;
import com.tytngn.fundsmanagement.dto.response.RoleResponse;
import com.tytngn.fundsmanagement.mapper.RoleMapper;
import com.tytngn.fundsmanagement.repository.PermissionRepository;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {

    RoleRepository roleRepository;

    PermissionRepository permissionRepository;

    RoleMapper roleMapper;

    public RoleResponse createRole(RoleRequest request) {

        var role = roleMapper.toRole(request);
        var permissions = permissionRepository.findAllById(request.getPermissions());

        role.setPermissions(new HashSet<>(permissions));

        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAllRoles() {
        var roles = roleRepository.findAll();
        return roles.stream().map(role -> roleMapper.toRoleResponse(role)).toList();
    }

    public void deleteRole (String roleId) {
        roleRepository.deleteById(roleId);
    }
}
