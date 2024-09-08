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

import java.util.List;

@Component("securityExpression")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SecurityExpression { // Định nghĩa phương thức dùng cho xác thực phân quyền

    RoleRepository roleRepository;
    UserRepository userRepository;

    public boolean hasPermission(List<String> permissions) {
        // lấy thông tin người dùng hiện tại
        var auth = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        String id = jwt.getClaimAsString("userId");
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if((user.getUsername().equals("admin")) && (user.getStatus() == 9999))
            return true;

        var roleIds = roleRepository.findByUserId(id).stream().map(Role::getId).toList();
        roleIds.forEach(roleId -> log.info("Role: " + roleId));

        boolean result = roleRepository.existsByRoleIdsAndPermissionIds(roleIds, permissions);
        log.warn(String.valueOf(result));
        return roleRepository.existsByRoleIdsAndPermissionIds(roleIds, permissions);

    }

}
