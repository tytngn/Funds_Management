package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.TransactionTypeRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
import com.tytngn.fundsmanagement.service.TransactionTypeService;
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
@RequestMapping("/transactionTypes")
public class TransactionTypeController {

    TransactionTypeService transactionTypeService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_TRANSACTION_TYPE'})")
    ApiResponse<TransactionTypeResponse> createTransactionType(@RequestBody @Valid TransactionTypeRequest request) {
        return ApiResponse.<TransactionTypeResponse>builder()
                .code(1000)
                .result(transactionTypeService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_TRANSACTION_TYPES'})")
    ApiResponse<List<TransactionTypeResponse>> getAllTransactionTypes() {
        return ApiResponse.<List<TransactionTypeResponse>>builder()
                .code(1000)
                .result(transactionTypeService.getAll())
                .build();
    }

    // Lấy danh sách loại giao dịch đóng góp quỹ
    @GetMapping("/contribute")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TRANSTYPE_BY_STATUS_CONTRIBUTE'})")
    ApiResponse<List<TransactionTypeResponse>> getByStatusContribute() {
        return ApiResponse.<List<TransactionTypeResponse>>builder()
                .code(1000)
                .result(transactionTypeService.getByStatusContribute())
                .build();
    }

    // Lấy danh sách loại giao dịch rút quỹ
    @GetMapping("/withdraw")
    @PreAuthorize("@securityExpression.hasPermission({'GET_TRANSTYPE_BY_STATUS_WITHDRAW'})")
    ApiResponse<List<TransactionTypeResponse>> getByStatusWithdraw() {
        return ApiResponse.<List<TransactionTypeResponse>>builder()
                .code(1000)
                .result(transactionTypeService.getByStatusWithdraw())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_TRANSACTION_TYPE'})")
    ApiResponse<TransactionTypeResponse> updateTransactionType(@RequestParam String id,
                                                               @RequestBody @Valid TransactionTypeRequest request) {
        return ApiResponse.<TransactionTypeResponse>builder()
                .code(1000)
                .result(transactionTypeService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_TRANSACTION_TYPE'})")
    ApiResponse<Void> deleteTransactionType(@RequestParam String id) {
        transactionTypeService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
