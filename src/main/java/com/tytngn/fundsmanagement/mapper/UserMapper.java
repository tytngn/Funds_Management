package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Tạo user
    User toUser(UserCreationRequest request);

    // map user về response
    UserResponse toUserResponse(User user);


    // Cập nhật user
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
