package com.tytngn.fundsmanagement.configuration;

import com.tytngn.fundsmanagement.entity.Role;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.repository.RoleRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Component("securityExpression")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityExpression { // Định nghĩa phương thức dùng cho xác thực phân quyền

    RoleRepository roleRepository;
    UserRepository userRepository;

    // Phương thức lấy userId từ JWT token
    public String getUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        return jwt.getClaimAsString("userId");
    }

    // Phương thức lấy quyền hạn (scope) từ JWT token
    public List<String> getUserScope() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        return jwt.getClaimAsStringList("scope");
    }

    // Phương thức kiểm tra quyền hạn dựa trên danh sách permissions
    public boolean hasPermission(List<String> permissions) {

        // Lấy userId từ JWT
        String id = getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Kiểm tra nếu là admin đặc biệt
        if((user.getUsername().equals("admin")) && (user.getStatus() == 9999))
            return true;

        // Lấy danh sách roleIds của user
        var roleIds = roleRepository.findByUserId(id).stream().map(Role::getId).toList();
        roleIds.forEach(roleId -> log.info("Role: " + roleId));

        // Kiểm tra quyền hạn của user
        boolean result = roleRepository.existsByRoleIdsAndPermissionIds(roleIds, permissions);
        log.warn(String.valueOf(result));
        return roleRepository.existsByRoleIdsAndPermissionIds(roleIds, permissions);
    }


    // Phương thức kiểm tra quyền hạn của một người dùng cụ thể dựa trên danh sách permissions
    public boolean hasPermission(String userId, List<String> permissions) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        if(user.getStatus() == 9999)
            return true;

        if (user.getStatus() != 1)
            return false;

        var roleIds = user.getRoles()
                .stream()
                .map(Role::getId)
                .toList();

        if(CollectionUtils.isEmpty(roleIds)){
            return false;
        }

        log.info("---LOG ROLE FROM SECURITY METHOD---");
        roleIds.forEach(roleId -> log.info("Role: " + roleId));

        // Kiểm tra nếu role có permission tương ứng
        return roleRepository.existsByRoleIdsAndPermissionIds(roleIds, permissions);
    }
}
