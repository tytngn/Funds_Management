package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.request.TransactionTypeRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
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
    ApiResponse<FundTransactionResponse> createTransactionType(@RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_FUND_TRANSACTIONS'})")
    ApiResponse<List<FundTransactionResponse>> getAllTransactionTypes() {
        return ApiResponse.<List<FundTransactionResponse>>builder()
                .code(1000)
                .result(fundTransactionService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND_TRANSACTION'})")
    ApiResponse<FundTransactionResponse> updateTransactionType(@RequestParam String id,
                                                               @RequestBody @Valid FundTransactionRequest request) {
        return ApiResponse.<FundTransactionResponse>builder()
                .code(1000)
                .result(fundTransactionService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_FUND_TRANSACTION'})")
    ApiResponse<Void> deleteTransactionType(@RequestParam String id) {
        fundTransactionService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
