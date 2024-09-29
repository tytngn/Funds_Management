package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundPermissionRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundPermissionResponse;
import com.tytngn.fundsmanagement.service.FundPermissionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/fund-permissions")
public class FundPermissionController {

    FundPermissionService fundPermissionService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'GRANT_PERMISSIONS_TO_USERS'})")
    ApiResponse<List<FundPermissionResponse>> grantPermissionsToUsers(@RequestBody @Valid FundPermissionRequest request) {
        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(fundPermissionService.grantPermissionsToUsers(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_USERS_WITH_PERMISSIONS'})")
    ApiResponse<List<FundPermissionResponse>> getUsersWithPermissions(@RequestParam String fundId) {
        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(fundPermissionService.getUsersWithPermissions(fundId))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USERS_PERMISSIONS_IN_FUND'})")
    ApiResponse<FundPermissionResponse> getUserPermissionInFund(@PathVariable String id) {
        return ApiResponse.<FundPermissionResponse>builder()
                .code(1000)
                .result(fundPermissionService.getUserPermissionInFund(id))
                .build();
    }

    @PutMapping()
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND_PERMISSION'})")
    ApiResponse<FundPermissionResponse> updateFundPermission(@RequestParam String userId, @RequestParam String fundId,
                                           @RequestParam boolean canContribute, @RequestParam boolean canWithdraw) {
        return ApiResponse.<FundPermissionResponse>builder()
                .code(1000)
                .result(fundPermissionService.updateFundPermissions(userId, fundId, canContribute, canWithdraw))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'REVOKE_FUND_PERMISSIONS'})")
    ApiResponse<Void> revokeFundPermissions(@PathVariable String id) {
        fundPermissionService.revokeFundPermissions(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
