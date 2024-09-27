package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.FundMemberResponse;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.dto.response.UserSimpleResponse;
import com.tytngn.fundsmanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Tạo user
    @Mapping(target = "department", source = "departmentId", ignore = true)
    User toUser(UserCreationRequest request);

    // map user về response
    @Mapping(target = "department", source = "department")
    @Mapping(target = "account", source = "account")
    UserResponse toUserResponse(User user);

    UserSimpleResponse toUserSimpleResponse(User user);

    @Mapping(target = "status", ignore = true)
    FundMemberResponse toFundMemberResponse(User user);

    // Cập nhật user
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "department", source = "departmentId", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
