package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.service.UserService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/users")
public class UserController {

    UserService userService;

    // tạo User
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_USER'})")
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .code(1000)
                .build();
    }

    // lấy User dựa trên id
    @GetMapping("/{userId}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USER_BY_ID'})")
    ApiResponse<UserResponse> getUserById(@PathVariable String userId) {

        // user nào đang đăng nhập hiện tại
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .code(1000)
                .build();
    }

    // lấy thông tin user đang đăng nhập
    @GetMapping("/myInfo")
    @PreAuthorize("@securityExpression.hasPermission({'GET_MY_INFORMATION'})")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .code(1000)
                .build();
    }

    // Lấy toàn bộ User hoặc lấy User dựa trên username
    @GetMapping()
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_USER', 'GET_USER_BY_USERNAME'})")
    ApiResponse <List<UserResponse>> getUsersByName(@RequestParam (required = false) String username) {

        // user nào đang đăng nhập hiện tại
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
//        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        // Lấy toàn bộ User
        if(username == null) {
            return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUsers())
                .code(1000)
                .build();
        }
        // Lấy User dựa trên username
        else {
            List<UserResponse> users = new ArrayList<>();
            UserResponse userResponse = userService.getUserByUsername(username);
            if(userResponse != null) users.add(userResponse);

            return ApiResponse.<List<UserResponse>>builder()
                    .result(users)
                    .code(1000)
                    .build();
        }
    }

    // chỉnh sửa User dựa trên id
    @PutMapping()
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_USER'})")
    ApiResponse<UserResponse> updateUserById(@RequestBody UserUpdateRequest request, @RequestParam String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
                .code(1000)
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_USER'})")
    ApiResponse<Void> deleteUserById(@RequestParam String id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
