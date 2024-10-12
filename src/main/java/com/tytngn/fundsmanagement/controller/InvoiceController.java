package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.ImageUpLoad;
import com.tytngn.fundsmanagement.dto.request.InvoiceRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.InvoiceResponse;
import com.tytngn.fundsmanagement.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/invoices")
public class InvoiceController {

    InvoiceService invoiceService;

    // Tạo hoá đơn
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_INVOICE'})")
    ApiResponse<InvoiceResponse> createInvoice( @RequestPart("invoice") @Valid InvoiceRequest request,
                                                @RequestPart("images") @Valid ImageUpLoad imageUpload) throws IOException {
        return ApiResponse.<InvoiceResponse>builder()
                .code(1000)
                .result(invoiceService.create(request, imageUpload))
                .build();
    }

    // Lấy danh sách tất cả các hoá đơn
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_INVOICES'})")
    ApiResponse<List<InvoiceResponse>> getAllInvoices() {
        return ApiResponse.<List<InvoiceResponse>>builder()
                .code(1000)
                .result(invoiceService.getAll())
                .build();
    }

    // Lấy danh sách các hoá đơn của 1 đề nghị thanh toán
    @GetMapping("/paymentReq/{paymentReqId}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_INVOICES_BY_PAYMENT_REQUEST'})")
    ApiResponse<List<InvoiceResponse>> getInvoicesByPaymentReq(@PathVariable String paymentReqId) {
        return ApiResponse.<List<InvoiceResponse>>builder()
                .code(1000)
                .result(invoiceService.getInvoicesByPaymentReq(paymentReqId))
                .build();
    }

    // Cập nhật hoá đơn
    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_INVOICE'})")
    ApiResponse<InvoiceResponse> updateInvoice(@RequestParam String id,
                                               @RequestBody @Valid InvoiceRequest request) {
        return ApiResponse.<InvoiceResponse>builder()
                .code(1000)
                .result(invoiceService.update(id, request))
                .build();
    }

    // Xoá hoá đơn
    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_INVOICE'})")
    ApiResponse<Void> deleteInvoice(@RequestParam String id) {
        invoiceService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
