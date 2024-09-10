package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.RoleRequest;
import com.tytngn.fundsmanagement.dto.response.RoleResponse;
import com.tytngn.fundsmanagement.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    // Tạo role
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    // map role về response
    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    void updateRole(@MappingTarget Role role, RoleRequest request);
}
