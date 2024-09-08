package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.PermissionRequest;
import com.tytngn.fundsmanagement.dto.response.PermissionSimpleResponse;
import com.tytngn.fundsmanagement.dto.response.PermissionResponse;
import com.tytngn.fundsmanagement.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    // Tạo permission
    @Mapping(target = "functions", ignore = true)
    Permission toPermission(PermissionRequest request);

    // map permission về response
    PermissionSimpleResponse toPermissionOnlyResponse(Permission permission);

    @Mapping(target = "function", source = "functions")
    PermissionResponse toPermissionResponse(Permission permission);

    @Mapping(target = "functions", ignore = true)
    void updatePermission(@MappingTarget Permission permission, PermissionRequest request);
}
