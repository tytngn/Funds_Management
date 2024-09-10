package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.DepartmentRequest;
import com.tytngn.fundsmanagement.dto.response.DepartmentResponse;
import com.tytngn.fundsmanagement.dto.response.DepartmentSimpleResponse;
import com.tytngn.fundsmanagement.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {

    // Tạo Department
    @Mapping(target = "users", ignore = true)
    Department toDepartment(DepartmentRequest request);

    // map Department về response
    @Mapping(target = "users", source = "users")
    DepartmentResponse toDepartmentResponse(Department department);

    DepartmentSimpleResponse toDepartmentSimpleResponse(Department department);

    @Mapping(target = "users", ignore = true)
    void updateDepartment(@MappingTarget Department department, DepartmentRequest request);
}
