package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.BankAccountRequest;
import com.tytngn.fundsmanagement.dto.request.DepartmentRequest;
import com.tytngn.fundsmanagement.dto.response.*;
import com.tytngn.fundsmanagement.service.BankAccountService;
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
@RequestMapping("/accounts")
public class BankAccountController {

    BankAccountService bankAccountService;

    @PostMapping
//    @PreAuthorize("@securityExpression.hasPermission({'CREATE_BANK_ACCOUNT'})")
    ApiResponse<BankAccountResponse> createBankAccount(@RequestBody @Valid BankAccountRequest request) {
        return ApiResponse.<BankAccountResponse>builder()
                .result(bankAccountService.createBankAccount(request))
                .code(1000)
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_BANK_ACCOUNT'})")
    ApiResponse<List<BankAccountResponse>> getAllBankAccount() {
        return ApiResponse.<List<BankAccountResponse>>builder()
                .result(bankAccountService.getAllBankAccount())
                .code(1000)
                .build();
    }


    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_BANK_ACCOUNT_BY_ID'})")
    public ApiResponse<BankAccountResponse> getBankAccountById(@PathVariable String id) {
        return ApiResponse.<BankAccountResponse>builder()
                .result(bankAccountService.getBankAccountById(id))
                .code(1000)
                .build();
    }


    @PutMapping("/{id}")
//    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_BANK_ACCOUNT'})")
    ApiResponse<BankAccountResponse> updateBankAccount(@PathVariable String id, @RequestBody @Valid BankAccountRequest request) {
        return ApiResponse.<BankAccountResponse>builder()
                .result(bankAccountService.updateBankAccount(id, request))
                .code(1000)
                .build();
    }
}

