package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.*;
import com.tytngn.fundsmanagement.dto.response.UserResponse;
import com.tytngn.fundsmanagement.entity.BankAccount;
import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.BankAccountMapper;
import com.tytngn.fundsmanagement.mapper.UserMapper;
import com.tytngn.fundsmanagement.repository.BankAccountRepository;
import com.tytngn.fundsmanagement.repository.DepartmentRepository;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    DepartmentRepository departmentRepository;
    BankAccountRepository bankAccountRepository;

    UserMapper userMapper;
    BankAccountMapper bankAccountMapper;

    PasswordEncoder passwordEncoder;
    SecurityExpression securityExpression;

    // tạo User
    public UserResponse createUser(UserCreationRequest request) {
        // Kiểm tra username đã tồn tại chưa
        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTS);

        // Kiểm tra email đã tồn tại chưa
        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_EXISTS);

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
        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        if(user.getStatus() == 9999){
            Set<Role> roles = new HashSet<>(roleRepository.findAll());
            user.setRoles(roles);
        }

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
                .sorted(Comparator.comparing(UserResponse::getCreatedDate).reversed())
                .collect(Collectors.toList());
    }


    // Admin update User dựa trên id
    public UserResponse updateUser(String userId, UserUpdateRequest request) {

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        // Kiểm tra email đã tồn tại chưa
        if (!user.getEmail().equals(request.getEmail())) {
            if(userRepository.existsByEmail(request.getEmail()))
                throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        userMapper.updateUser(user, request);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (user.getStatus() == 9999){
            throw new AppException(ErrorCode.ADMIN_NOT_EDITABLE);
        }

        var roles = roleRepository.findAllById(request.getRoleId());
        user.setRoles(new HashSet<>(roles));

        var department = departmentRepository.findById(request.getDepartmentId()).orElseThrow(() ->
                new AppException(ErrorCode.DEPARTMENT_NOT_EXISTS));
        user.setDepartment(department);

        user.setUpdatedDate(LocalDate.now());

        return userMapper.toUserResponse(userRepository.save(user));
    }


    // Người dùng update tài khoản bao gồm tên ngân hàng và số tài khoản
    public UserResponse updateUserAccount(AccountUpdateRequest request) {
        // Lấy thông tin người dùng hiện tại từ token
        String userId = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // Kiểm tra email đã tồn tại chưa
        if (!user.getEmail().equals(request.getEmail())) {
            if(userRepository.existsByEmail(request.getEmail()))
                throw new AppException(ErrorCode.EMAIL_EXISTS);
        }

        // Không cho phép người dùng chỉnh sửa nếu trạng thái tài khoản là 9999
        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.ADMIN_NOT_EDITABLE);
        }

        // Cập nhật thông tin cá nhân
        userMapper.updateUserAccount(user, request);

        // Cập nhật hoặc tạo mới tài khoản ngân hàng
        BankAccount bankAccount = user.getAccount();
        BankAccountRequest bankAccountRequest = BankAccountRequest.builder()
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .build();
        if (bankAccount == null) {
            bankAccount = bankAccountMapper.toBankAccount(bankAccountRequest);
            bankAccount.setUser(user);
            bankAccount.setCreatedDate(LocalDate.now());
            bankAccountRepository.save(bankAccount);
        } else {
            bankAccountMapper.updateBankAccounts(bankAccount, request);
            bankAccount.setCreatedDate(LocalDate.now());
            bankAccountRepository.save(bankAccount);
        }

        user.setAccount(bankAccount);
        user.setUpdatedDate(LocalDate.now());

        // Lưu thay đổi
        userRepository.save(user);

        return userMapper.toUserResponse(user);
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


    // Đổi mật khẩu cho tài khoản
    public UserResponse changePassword(ChangePasswordRequest request) {

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // Kiểm tra mật khẩu hiện tại có đúng không
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        // Kiểm tra xem mật khẩu mới có khác mật khẩu hiện tại không
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.NEW_PASSWORD_MUST_BE_DIFFERENT);
        }

        // Mã hóa mật khẩu mới và lưu lại
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Cập nhật ngày thay đổi mật khẩu
        user.setUpdatedDate(LocalDate.now());

        // Lưu lại user
        userRepository.save(user);

        // Trả về UserResponse sau khi đổi mật khẩu
        return userMapper.toUserResponse(user);
    }


    // vô hiệu hóa tài khoản
    public UserResponse disableUser(String userId) {

        // Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        if (user.getStatus() == 9999){
            throw new AppException(ErrorCode.ADMIN_NOT_EDITABLE);
        }

        // Cập nhật status = 0 để vô hiệu hoá tài khoản
        user.setStatus(0);

        // Cập nhật ngày sửa đổi
        user.setUpdatedDate(LocalDate.now());

        // Lưu user sau khi cập nhật và trả về response
        return userMapper.toUserResponse(userRepository.save(user));
    }


    public void deleteUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        if (user.getStatus() == 9999){
            throw new AppException(ErrorCode.ADMIN_NOT_EDITABLE);
        }

        userRepository.deleteById(userId);
    }
}

