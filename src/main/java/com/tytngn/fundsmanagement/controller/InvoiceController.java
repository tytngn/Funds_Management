package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.InvoiceRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.InvoiceResponse;
import com.tytngn.fundsmanagement.service.InvoiceService;
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
@RequestMapping("/invoices")
public class InvoiceController {

    InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_INVOICE'})")
    ApiResponse<InvoiceResponse> createInvoice(@RequestBody @Valid InvoiceRequest request) {
        return ApiResponse.<InvoiceResponse>builder()
                .code(1000)
                .result(invoiceService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_INVOICES'})")
    ApiResponse<List<InvoiceResponse>> getAllInvoices() {
        return ApiResponse.<List<InvoiceResponse>>builder()
                .code(1000)
                .result(invoiceService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_INVOICE'})")
    ApiResponse<InvoiceResponse> updateInvoice(@RequestParam String id,
                                               @RequestBody @Valid InvoiceRequest request) {
        return ApiResponse.<InvoiceResponse>builder()
                .code(1000)
                .result(invoiceService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_INVOICE'})")
    ApiResponse<Void> deleteInvoice(@RequestParam String id) {
        invoiceService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
