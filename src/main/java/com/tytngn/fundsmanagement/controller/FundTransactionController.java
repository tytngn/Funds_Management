package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundContributionRequest;
import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundContributionResponse;
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

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/fundTransactions")
public class FundTransactionController {

    FundTransactionService fundTransactionService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> createTransaction(@RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.create(request))
                .build();
    }

    // Lấy tổng số tiền giao dịch của người dùng trong một quỹ
    @GetMapping("/total-contribution")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TOTAL_CONTRIBUTION'})")
    ApiResponse <List<FundContributionResponse>> getFundTransactionSummary(@RequestBody @Valid FundContributionRequest request) {
        return ApiResponse.<List<FundContributionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getFundTransactionSummary(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_FUND_TRANSACTIONS'})")
    ApiResponse<List<FundTransactionResponse>> getAllTransaction() {
        return ApiResponse.<List<FundTransactionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_TRANSACTION_BY_ID'})")
    ApiResponse<FundTransactionResponse> getTransactionById(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.getById(id))
                .build();
    }

    // Lấy danh sách giao dịch đóng góp quỹ theo quỹ, theo loại giao dịch và theo thời gian
    @GetMapping("/contribution")
    @PreAuthorize("@securityExpression.hasPermission({'GET_CONTRIBUTION_BY_FUND_TYPE_AND_DATE'})")
    public ApiResponse<List<FundTransactionResponse>> getContributionByFundTypeAndDate(
            @RequestParam (required = false) String fundId,
            @RequestParam (required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;

        return ApiResponse.<List<FundTransactionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getContributionByFundTypeAndDate(fundId, transTypeId, startDate, endDate))
                .build();
    }

    // Lấy danh sách giao dịch rút quỹ theo quỹ, theo loại giao dịch và theo thời gian
    @GetMapping("/withdraw")
    @PreAuthorize("@securityExpression.hasPermission({'GET_WITHDRAW_BY_FUND_TYPE_AND_DATE'})")
    public ApiResponse<List<FundTransactionResponse>> getWithdrawByFundTypeAndDate(
            @RequestParam (required = false) String fundId,
            @RequestParam (required = false) String transTypeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        fundId = (fundId != null && !fundId.isEmpty()) ? fundId : null;
        transTypeId = (transTypeId != null && !transTypeId.isEmpty()) ? transTypeId : null;

        return ApiResponse.<List<FundTransactionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getWithdrawByFundTypeAndDate(fundId, transTypeId, startDate, endDate))
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> updateTransaction(@RequestParam String id,
                                                               @RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.update(id, request))
                .build();
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'APPROVE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> approveTransaction(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.approveTransaction(id))
                .build();
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'REJECT_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> rejectTransaction(@PathVariable String id) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.rejectTransaction(id))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_FUND_TRANSACTION'})")
    ApiResponse<Void> deleteTransaction(@RequestParam String id) {
        fundTransactionService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
