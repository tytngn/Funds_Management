package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.PaymentCategoryRequest;
import com.tytngn.fundsmanagement.dto.request.TransactionTypeRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.PaymentCategoryResponse;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
import com.tytngn.fundsmanagement.service.PaymentCategoryService;
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
@RequestMapping("/paymentCategory")
public class PaymentCategoryController {

    PaymentCategoryService paymentCategoryService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_PAYMENT_CATEGORY'})")
    ApiResponse<PaymentCategoryResponse> createTransactionType(@RequestBody @Valid PaymentCategoryRequest request) {
        return ApiResponse.<PaymentCategoryResponse>builder()
                .code(1000)
                .result(paymentCategoryService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_PAYMENT_CATEGORY'})")
    ApiResponse<List<PaymentCategoryResponse>> getAllTransactionTypes() {
        return ApiResponse.<List<PaymentCategoryResponse>>builder()
                .code(1000)
                .result(paymentCategoryService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_PAYMENT_CATEGORY'})")
    ApiResponse<PaymentCategoryResponse> updateTransactionType(@RequestParam String id,
                                                               @RequestBody @Valid PaymentCategoryRequest request) {
        return ApiResponse.<PaymentCategoryResponse>builder()
                .code(1000)
                .result(paymentCategoryService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_PAYMENT_CATEGORY'})")
    ApiResponse<Void> deleteTransactionType(@RequestParam String id) {
        paymentCategoryService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
