package com.tytngn.fundsmanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.*;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.AuthenticationResponse;
import com.tytngn.fundsmanagement.dto.response.IntrospectResponse;
import com.tytngn.fundsmanagement.service.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    SecurityExpression securityExpression;

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request, HttpServletResponse response) {

        // Xác thực người dùng và tạo JWT
        var result = authenticationService.authenticate(request);

        if(result.isAuthenticated()){
            // Tạo cookie chứa JWT
            Cookie cookie = new Cookie("authToken", result.getToken());
            cookie.setHttpOnly(false); // Cookie không thể bị truy cập từ JavaScript
            cookie.setSecure(false); // Cookie chỉ được gửi qua kết nối HTTPS
            cookie.setPath("/"); // Cookie có hiệu lực cho tất cả các đường dẫn
            cookie.setMaxAge(7 * 24 * 60 * 60); // Cookie tồn tại trong 7 ngày

            // Thêm cookie vào response
            response.addCookie(cookie);
            response.setHeader("Authorization", "Bearer " + result.getToken());
        }

        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .code(1000)
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {

        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .code(1000)
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {

        var result = authenticationService.refresh(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .code(1000)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {

        authenticationService.logout(request);
        return ApiResponse.<Void>builder().code(1000).build();
    }

    @PostMapping("/get-role")
    ApiResponse<List<String>> getUserRole() {
        List<String> roles = authenticationService.getUserRole();
        return ApiResponse.<List<String>>builder()
                .result(roles)
                .code(1000)
                .build();
    }

}
