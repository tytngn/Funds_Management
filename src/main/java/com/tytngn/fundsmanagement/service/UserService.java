package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.UserMapper;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    // tạo User
    public UserResponse createUser(UserCreationRequest request) {

        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // role mặc định là USER
        HashSet<Role> roles = new HashSet<>();
        Optional<Role> optionalRole = roleRepository.findById("USER");
        if(optionalRole.isPresent()){
            roles.add(optionalRole.get());
        }
        user.setRoles(roles);

        user.setStatus(1);
        user.setCreatedDate(LocalDate.now());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // lấy danh sách toàn bộ Users
    public List<UserResponse> getAllUsers() {
        var users = userRepository.findAll().stream().map(userMapper::toUserResponse)
                .collect(Collectors.toList());

        return users;
    }

    // lấy thông tin user đang đăng nhập
    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        return userMapper.toUserResponse(user);
    }


    // lấy User dựa trên id
    public UserResponse getUserById(String id) {
        return userMapper.toUserResponse(userRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS)));
    }

    // Lấy User dựa trên username
    public UserResponse getUserByUsername(String username) {
        return userMapper.toUserResponse(userRepository.findByUsername(username).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS)));
    }

    // update User dựa trên id
    public UserResponse updateUser(String userId, UserUpdateRequest request) {

        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));
        user.setUpdatedDate(LocalDate.now());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String userId) {
        userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        userRepository.deleteById(userId);
    }
}

