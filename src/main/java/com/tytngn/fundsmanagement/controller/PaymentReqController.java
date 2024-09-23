package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.request.PaymentReqRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.dto.response.PaymentReqResponse;
import com.tytngn.fundsmanagement.service.PaymentReqService;
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
@RequestMapping("/paymentRequests")
public class PaymentReqController {

    PaymentReqService paymentReqService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_PAYMENT_REQUEST'})")
    ApiResponse<PaymentReqResponse> createPaymentReq(@RequestBody @Valid PaymentReqRequest request) {
        return ApiResponse.<PaymentReqResponse>builder()
                .code(1000)
                .result(paymentReqService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_PAYMENT_REQUEST'})")
    ApiResponse<List<PaymentReqResponse>> getAllPaymentReq() {
        return ApiResponse.<List<PaymentReqResponse>>builder()
                .code(1000)
                .result(paymentReqService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_PAYMENT_REQUEST'})")
    ApiResponse<PaymentReqResponse> updatePaymentReq(@RequestParam String id,
                                                          @RequestBody @Valid PaymentReqRequest request) {
        return ApiResponse.<PaymentReqResponse>builder()
                .code(1000)
                .result(paymentReqService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_PAYMENT_REQUEST'})")
    ApiResponse<Void> deletePaymentReq(@RequestParam String id) {
        paymentReqService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
