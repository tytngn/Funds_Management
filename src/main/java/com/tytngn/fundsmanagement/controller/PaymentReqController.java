package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.PaymentReqRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
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
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/payment-requests")
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

    // Lấy danh sách đề nghị thanh toán theo bộ lọc
    @GetMapping("/filter")
    @PreAuthorize("@securityExpression.hasPermission({'FILTER_PAYMENT_REQUEST'})")
    ApiResponse<Map<String, Object>> filterPaymentRequests(@RequestParam(required = false) String categoryId,
                                                                @RequestParam(required = false) String start,
                                                                @RequestParam(required = false) String end,
                                                                @RequestParam(required = false) Integer status,
                                                                @RequestParam(required = false) String departmentId,
                                                                @RequestParam(required = false) String userId)
    {
        categoryId = (categoryId != null && !categoryId.isEmpty()) ? categoryId : null;
        status = (status != null) ? status : null;
        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(paymentReqService.filterPaymentRequests(categoryId, start, end, status, departmentId, userId))
                .build();
    }


    // Lấy danh sách đề nghị thanh toán của một người dùng theo bộ lọc
    @GetMapping("/user/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_USER_PAYMENT_REQUESTS_BY_FILTER'})")
    public ApiResponse<Map<String, Object>> getUserPaymentRequestsByFilter(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer status)
    {
        categoryId = (categoryId != null && !categoryId.isEmpty()) ? categoryId : null;
        status = (status != null) ? status : null;

        Map<String, Object> result = paymentReqService.getUserPaymentRequestsByFilter(
                categoryId, startDate, endDate, status);

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(result)
                .build();
    }


    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_PAYMENT_REQUEST_BY_ID'})")
    ApiResponse<PaymentReqResponse> getFundById(@PathVariable String id) {
        return ApiResponse.<PaymentReqResponse>builder()
                .code(1000)
                .result(paymentReqService.getById(id))
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

    // Gửi đề nghị thanh toán
    @PutMapping("/send/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'SEND_PAYMENT_REQUEST'})")
    public ApiResponse<PaymentReqResponse> sendPaymentReq(@PathVariable String id) {
        return ApiResponse.<PaymentReqResponse>builder()
                .code(1000)
                .result(paymentReqService.sendPaymentRequest(id))
                .build();
    }

    // Xác nhận đề nghị thanh toán
    @PutMapping("/confirm/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'CONFIRM_PAYMENT_REQUEST'})")
    public ApiResponse<PaymentReqResponse> confirmPaymentReq(@PathVariable String id, @RequestParam boolean isApproved) {
        return ApiResponse.<PaymentReqResponse>builder()
                .code(1000)
                .result(paymentReqService.confirmPaymentRequest(id, isApproved))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_PAYMENT_REQUEST'})")
    ApiResponse<Void> deletePaymentReq(@RequestParam String id) {
        paymentReqService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
