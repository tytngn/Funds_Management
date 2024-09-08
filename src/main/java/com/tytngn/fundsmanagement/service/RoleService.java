package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.RoleRequest;
import com.tytngn.fundsmanagement.dto.response.RoleResponse;
import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.RoleMapper;
import com.tytngn.fundsmanagement.repository.PermissionRepository;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
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
    UserRepository userRepository;

    public RoleResponse createRole(RoleRequest request) {

        if (roleRepository.existsById(request.getId()))
            throw new AppException(ErrorCode.ROLE_EXISTS);

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

    public RoleResponse updateRole(String id, RoleRequest request) {

        Role role = roleRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTS));
        roleMapper.toRole(request);

        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    public void deleteRole (String roleId) {
        var role = roleRepository.findById(roleId).orElseThrow(() ->
                new AppException(ErrorCode.ROLE_NOT_EXISTS));

        var users = role.getUsers();
        for (User user : users) {
            user.getRoles().remove(role);
        }
        userRepository.saveAll(users);
        roleRepository.deleteById(roleId);
    }
}
