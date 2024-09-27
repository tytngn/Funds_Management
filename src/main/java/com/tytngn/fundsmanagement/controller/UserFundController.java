package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.UserFundRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundMemberResponse;
import com.tytngn.fundsmanagement.dto.response.UserFundResponse;
import com.tytngn.fundsmanagement.entity.UserFundId;
import com.tytngn.fundsmanagement.service.UserFundService;
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
@RequestMapping("/user-fund")
public class UserFundController {

    UserFundService userFundService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'ASSIGN_USER_TO_FUND'})")
    ApiResponse<UserFundResponse> assign(@RequestBody @Valid UserFundRequest request) {
        return ApiResponse.<UserFundResponse>builder()
                .code(1000)
                .result(userFundService.assignUserToFund(request))
                .build();
    }

    // Lấy danh sách các quỹ mà user được giao dịch
    @GetMapping("/user")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUNDS_BY_USER_ID'})")
    ApiResponse<List<UserFundResponse>> getFundsByUserId(@RequestParam String userId) {
        return ApiResponse.<List<UserFundResponse>>builder()
                .code(1000)
                .result(userFundService.getFundsByUserId(userId))
                .build();
    }

    // Lấy danh sách người dùng được giao dịch với quỹ
    @GetMapping("/fund")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_BY_ID'})")
    ApiResponse<List<UserFundResponse>> getUsersByFundId(@RequestParam String fundId) {
        return ApiResponse.<List<UserFundResponse>>builder()
                .code(1000)
                .result(userFundService.getUsersByFundId(fundId))
                .build();
    }

    // Lấy danh sách chi tiết người dùng được giao dịch với quỹ
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_MEMBERS_BY_FUND_ID'})")
    ApiResponse<List<FundMemberResponse>> getMembersByFundId(@RequestParam String fundId) {
        return ApiResponse.<List<FundMemberResponse>>builder()
                .code(1000)
                .result(userFundService.getMembersByFundId(fundId))
                .build();
    }

    // Cập nhật trạng thái giữa user và fund
    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_USER_FUND_STATUS'})")
    ApiResponse<UserFundResponse> updateUserFundStatus(@RequestParam UserFundId id, @RequestParam int status) {
        return ApiResponse.<UserFundResponse>builder()
                .code(1000)
                .result(userFundService.updateUserFundStatus(id, status))
                .build();
    }

}
