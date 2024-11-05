package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundPermissionRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundPermissionResponse;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.service.FundPermissionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/fund-permissions")
public class FundPermissionController {

    FundPermissionService fundPermissionService;

    // cấp quyền cho danh sách người dùng
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'GRANT_PERMISSIONS_TO_USERS'})")
    ApiResponse<List<FundPermissionResponse>> grantPermissionsToUsers(@RequestBody @Valid FundPermissionRequest request) {
        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(fundPermissionService.grantPermissionsToUsers(request))
                .build();
    }

    // Lấy danh sách người dùng đã được cấp quyền giao dịch
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_USERS_WITH_PERMISSIONS'})")
    ApiResponse<List<FundPermissionResponse>> getUsersWithPermissions(@RequestParam String fundId) {
        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(fundPermissionService.getUsersWithPermissions(fundId))
                .build();
    }

    // Lấy thông tin phân quyền của người dùng trong quỹ
    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USERS_PERMISSIONS_IN_FUND'})")
    ApiResponse<FundPermissionResponse> getUserPermissionInFund(@PathVariable String id) {
        return ApiResponse.<FundPermissionResponse>builder()
                .code(1000)
                .result(fundPermissionService.getUserPermissionInFund(id))
                .build();
    }

    // lấy danh sách quỹ mà người dùng có quyền đóng góp
    @GetMapping("/contribute")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUNDS_USER_CAN_CONTRIBUTE'})")
    public ApiResponse<List<FundResponse>> getFundsUserCanContribute() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundPermissionService.getFundsUserCanContribute())
                .build();
    }

    // lấy danh sách quỹ mà người dùng có quyền rút quỹ
    @GetMapping("/withdraw")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUNDS_USER_CAN_WITHDRAW'})")
    public ApiResponse<List<FundResponse>> getFundsUserCanWithdraw() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundPermissionService.getFundsUserCanWithdraw())
                .build();
    }

    // Lấy danh sách phân quyền giao dịch theo quỹ, theo bộ lọc (theo thời gian, theo trạng thái, theo phòng ban, theo cá nhân)
    @GetMapping("/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_PERMISSIONS_BY_FILTER'})")
    public ApiResponse<List<FundPermissionResponse>> filterFundPermissions(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) Boolean canContribute,
            @RequestParam(required = false) Boolean canWithdraw,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId)
    {
        List<FundPermissionResponse> filteredPermissions = fundPermissionService.filterFundPermissions(fundId, start, end,
                canContribute, canWithdraw, departmentId, userId);

        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(filteredPermissions)
                .build();
    }

    // Lấy danh sách phân quyền đóng góp theo thủ quỹ, theo bộ lọc (theo quỹ, theo thời gian, theo trạng thái)
    @GetMapping("/filter/by-treasurer")
    @PreAuthorize("@securityExpression.hasPermission({'FILTER_FUND_PERMISSIONS_BY_TREASURER'})")
    public ApiResponse<List<FundPermissionResponse>> filterFundPermissionsByTreasurer(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId)
    {
        List<FundPermissionResponse> filteredPermissions = fundPermissionService.filterFundPermissionsByTreasurer(fundId, start, end, departmentId, userId);

        return ApiResponse.<List<FundPermissionResponse>>builder()
                .code(1000)
                .result(filteredPermissions)
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
