package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.service.FundTransactionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/fund-transactions")
public class FundTransactionController {

    FundTransactionService fundTransactionService;

    // Tạo giao dịch
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> createTransaction(@RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.create(request))
                .build();
    }


    // Lấy danh sách tất cả giao dịch
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_FUND_TRANSACTIONS'})")
    ApiResponse<List<FundTransactionResponse>> getAllTransaction() {
        return ApiResponse.<List<FundTransactionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getAll())
                .build();
    }


    // Lấy giao dịch bằng ID
    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_TRANSACTION_BY_ID'})")
    ApiResponse<FundTransactionResponse> getTransactionById(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.getById(id))
                .build();
    }

    // Lấy danh sách giao dịch đóng góp quỹ theo bộ lọc (theo thời gian, theo phòng ban, theo cá nhân)
    @GetMapping("/contribution/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_CONTRIBUTION_BY_FILTER'})")
     ApiResponse<Map<String, Object>> getContributionByFilter(
            @RequestParam (required = false) String fundId,
            @RequestParam (required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer status
    )
    {

        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;
        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;
        status = (status != null) ? status : null;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getContributionByFilter(fundId, transTypeId, startDate, endDate, departmentId, userId, status))
                .build();
    }


    // Lấy danh sách giao dịch đóng góp do thủ quỹ quản lý theo bộ lọc (theo quỹ, theo loại giao dịch, theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái)
    @GetMapping("/contribution/filter/by-treasurer")
    @PreAuthorize("@securityExpression.hasPermission({'FILTER_CONTRIBUTION_BY_TREASURER'})")
    ApiResponse<Map<String, Object>> filterContributionByTreasurer(
            @RequestParam (required = false) String fundId,
            @RequestParam (required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer status
    )
    {

        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;
        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;
        status = (status != null) ? status : null;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.filterContributionByTreasurer(fundId, transTypeId, startDate, endDate, departmentId, userId, status))
                .build();
    }


    // Lấy danh sách giao dịch đóng góp của một người dùng theo bộ lọc và tính tổng số tiền
    @GetMapping("/user-contributions/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USER_CONTRIBUTIONS_BY_FILTER'})")
    public ApiResponse<Map<String, Object>> getUserContributionsByFilter(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer status)
    {
        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;
        status = (status != null) ? status : null;

        Map<String, Object> result = fundTransactionService.getUserContributionsByFilter(
                fundId, transTypeId, startDate, endDate, status);

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(result)
                .build();
    }


    // Lấy danh sách giao dịch rút quỹ theo bộ lọc (theo thời gian, theo phòng ban, theo cá nhân)
    @GetMapping("/withdraw/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_WITHDRAW_BY_FILTER'})")
    public ApiResponse<Map<String, Object>> getWithdrawByFilter(
            @RequestParam (required = false) String fundId,
            @RequestParam (required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer status
    )
    {

        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;
        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;
        status = status != null ? status : -1;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getWithdrawByFilter(fundId, transTypeId, startDate, endDate, departmentId, userId, status))
                .build();
    }


    // Lấy danh sách giao dịch rút quỹ của một người dùng theo bộ lọc và tính tổng số tiền
    @GetMapping("/user-withdrawals/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USER_WITHDRAWALS_BY_FILTER'})")
    public ApiResponse<Map<String, Object>> getUserWithdrawalsByFilter(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer status)
    {
        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;
        status = (status != null) ? status : null;

        Map<String, Object> result = fundTransactionService.getUserWithdrawalsByFilter(
                fundId, transTypeId, startDate, endDate, status);

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(result)
                .build();
    }


    // Lấy báo cáo đóng góp của cá nhân theo bộ lọc
    @GetMapping("/individual-contribution-report")
    @PreAuthorize("@securityExpression.hasPermission({'GET_INDIVIDUAL_CONTRIBUTION_REPORT'})")
    ApiResponse<Map<String, Object>> getIndividualContributionReport(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getIndividualContributionReport(fundId, transTypeId, start, end, year, month))
                .build();
    }


    // Lấy báo cáo đóng góp của thủ quỹ theo bộ lọc
    @GetMapping("/treasurer-contribution-report")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TREASURER_CONTRIBUTION_REPORT'})")
    ApiResponse<Map<String, Object>> getTreasurerContributionReport(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getTreasurerContributionReport(fundId, transTypeId, start, end, year, month))
                .build();
    }


    // Lấy báo cáo rút quỹ của thủ quỹ theo bộ lọc
    @GetMapping("/treasurer-withdrawal-report")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TREASURER_WITHDRAWAL_REPORT'})")
    ApiResponse<Map<String, Object>> getTreasurerWithdrawalReport(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getTreasurerWithdrawalReport(fundId, transTypeId, start, end, year, month))
                .build();
    }


    // Lấy báo cáo giao dịch theo bộ lọc
    @GetMapping("/transaction-report")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TRANSACTION_REPORT'})")
    ApiResponse<Map<String, Object>> getTransactionReport(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) String transTypeId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getTransactionReport(fundId, transTypeId, status, start, end, year, month))
                .build();
    }


    // Lấy báo cáo đóng góp và thanh toán của người dùng trong tháng
    @GetMapping("/individual-month-report")
    @PreAuthorize("@securityExpression.hasPermission({'GET_INDIVIDUAL_MONTH_REPORT'})")
    ApiResponse<Map<String, Object>> getIndividualMonthlyReport() {
        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getIndividualMonthlyReport())
                .build();
    }


    @GetMapping("/individual-monthly")
    @PreAuthorize("@securityExpression.hasPermission({'GENERATE_INDIVIDUAL_MONTH_REPORT'})")
    public ApiResponse<Map<String, Object>> generateIndividualMonthlyReport() {
        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.generateIndividualMonthlyReport())
                .build();
    }

    @GetMapping("/summary")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TRANSACTION_SUMMARY'})")
    public ApiResponse<Map<String, Object>> getTransactionSummary() {
        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getTransactionSummaryByMonth())
                .build();
    }

    @GetMapping("/summary/by-treasurer")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TRANSACTION_SUMMARY_BY_TREASURER'})")
    public ApiResponse<Map<String, Object>> getTransactionSummaryByTreasurer() {
        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundTransactionService.getTransactionSummaryByMonthAndTreasurer())
                .build();
    }

    // cập nhật giao dịch
    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> updateTransaction(@RequestParam String id,
                                                               @RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.update(id, request))
                .build();
    }

    // duyệt giao dịch
    @PutMapping("/approve/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'APPROVE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> approveTransaction(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.approveTransaction(id))
                .build();
    }


    // từ chối giao dịch
    @PutMapping("/reject/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'REJECT_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> rejectTransaction(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.rejectTransaction(id))
                .build();
    }


    // xoá giao dịch
    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_FUND_TRANSACTION'})")
    ApiResponse<Void> deleteTransaction(@RequestParam String id) {
        fundTransactionService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
