package com.tytngn.fundsmanagement.controller;

import com.nimbusds.jose.JOSEException;
import com.tytngn.fundsmanagement.dto.request.*;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.AuthenticationResponse;
import com.tytngn.fundsmanagement.dto.response.IntrospectResponse;
import com.tytngn.fundsmanagement.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {

        var result = authenticationService.authenticate(request);
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
}
