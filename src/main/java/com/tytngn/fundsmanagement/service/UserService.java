package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.UserCreationRequest;
import com.tytngn.fundsmanagement.dto.request.UserUpdateRequest;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.UserMapper;
import com.tytngn.fundsmanagement.repository.DepartmentRepository;
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
    DepartmentRepository departmentRepository;

    // tạo User
    public UserResponse createUser(UserCreationRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);

        User user = userMapper.toUser(request);

        // Thiết lập mật khẩu mặc định
        user.setPassword(passwordEncoder.encode("vnpt@2024"));

        // Kiểm tra và thiết lập roles
        HashSet<Role> roles = new HashSet<>();
        if (request.getRoleId() != null && !request.getRoleId().isEmpty()) {
            for (String roleId : request.getRoleId()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTS));
                roles.add(role);
            }
        } else {
            // Nếu không có roleId nào được cung cấp, gán role mặc định là "USER"
            Role defaultRole = roleRepository.findById("USER")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTS));
            roles.add(defaultRole);
        }
        user.setRoles(roles);

        // Thiết lập trạng thái và ngày tạo
        user.setStatus(1);
        user.setCreatedDate(LocalDate.now());

        // Thiết lập phòng ban
        var department = departmentRepository.findById(request.getDepartmentId()).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));
        user.setDepartment(department);

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


    // lấy danh sách người dùng theo bộ lọc (theo thời gian, trạng thái, phòng ban, phân quyền, ngân hàng)
    public List<UserResponse> filterUsers(LocalDate start, LocalDate end, Integer status,
                                          String departmentId, String roleId, String bankName)
    {
        List<User> users = userRepository.filterUsers(start, end, status, departmentId, roleId, bankName);
        return users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }


    // update User dựa trên id
    public UserResponse updateUser(String userId, UserUpdateRequest request) {

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        userMapper.updateUser(user, request);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoleId());
        user.setRoles(new HashSet<>(roles));

        var department = departmentRepository.findById(request.getDepartmentId()).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));
        user.setDepartment(department);

        user.setUpdatedDate(LocalDate.now());

        return userMapper.toUserResponse(userRepository.save(user));
    }


    // Đặt lại mật khẩu mặc định cho tài khoản
    public UserResponse resetPasswordToDefault(String userId) {
        // Tìm user theo userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // Đặt lại mật khẩu mặc định
        user.setPassword(passwordEncoder.encode("vnpt@2024"));

        // Lưu lại user với mật khẩu mới
        userRepository.save(user);

        // Trả về UserResponse sau khi đặt lại mật khẩu
        return userMapper.toUserResponse(user);
    }


    // vô hiệu hóa tài khoản
    public UserResponse disableUser(String userId) {

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        // Cập nhật status = 0 để vô hiệu hoá tài khoản
        user.setStatus(0);

        // Cập nhật ngày sửa đổi
        user.setUpdatedDate(LocalDate.now());

        // Lưu user sau khi cập nhật và trả về response
        return userMapper.toUserResponse(userRepository.save(user));
    }


    public void deleteUser(String userId) {
        userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        userRepository.deleteById(userId);
    }
}

