package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.ApiResponse;
import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    ApiResponse<User> createUser(@RequestBody @Valid UserCreationRequest request) {
        ApiResponse<User> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.createUser(request));
        return apiResponse;
    }

    // lấy User dựa trên id
    @GetMapping("/{userId}")
    UserResponse getUserById(@PathVariable String userId) {
        return userService.getUserById(userId);
    }

    // Lấy toàn bộ User hoặc lấy User dựa trên username
    @GetMapping
    List<UserResponse> getUsersByName(@RequestParam (required = false) String username) {
        // Lấy toàn bộ User
        if(username == null) return userService.getAllUsers();
        // Lấy User dựa trên username
        else {
            List<UserResponse> users = new ArrayList<>();
            UserResponse userResponse = userService.getUserByUsername(username);
            if(userResponse != null) users.add(userResponse);
            return users;
        }
    }

    // chỉnh sửa User dựa trên id
    @PutMapping("/{userId}")
    UserResponse updateUserById(@RequestBody UserUpdateRequest request, @PathVariable String userId) {
        return userService.updateUser(userId, request);
    }
}
