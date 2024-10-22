package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.BudgetEstimateRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.BudgetEstimateResponse;
import com.tytngn.fundsmanagement.service.BudgetEstimateService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/budget-estimates")
public class BudgetEstimateController {

    BudgetEstimateService budgetEstimateService;

    // Tạo dự trù kinh phí
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_BUDGET_ESTIMATE'})")
    ApiResponse<BudgetEstimateResponse> createBudgetEstimate(@RequestBody @Valid BudgetEstimateRequest request) {
        return ApiResponse.<BudgetEstimateResponse>builder()
                .code(1000)
                .result(budgetEstimateService.create(request))
                .build();
    }

    // Lấy danh sách tất cả dự trù kinh phí
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_BUDGET_ESTIMATES'})")
    ApiResponse<List<BudgetEstimateResponse>> getAllBudgetEstimates() {
        return ApiResponse.<List<BudgetEstimateResponse>>builder()
                .code(1000)
                .result(budgetEstimateService.getAll())
                .build();
    }

    // Lấy danh sách dự trù kinh phí theo bộ lọc
    @GetMapping("/filter")
    @PreAuthorize("@securityExpression.hasPermission({'FILTER_BUDGET_ESTIMATES'})")
    ApiResponse<List<BudgetEstimateResponse>> filterBudgetEstimates(
            @RequestParam(required = false) String fundId,
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String userId) {

        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;
        status = (status != null) ? status : null;

        return ApiResponse.<List<BudgetEstimateResponse>>builder()
                .code(1000)
                .result(budgetEstimateService.filterBudgetEstimates(fundId, start, end, status, departmentId, userId))
                .build();
    }

    // Lấy dự trù kinh phí theo id
    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_BUDGET_ESTIMATE_BY_ID'})")
    ApiResponse<BudgetEstimateResponse> getBudgetEstimateById(@PathVariable String id) {

        return ApiResponse.<BudgetEstimateResponse>builder()
                .code(1000)
                .result(budgetEstimateService.getBudgetEstimateById(id))
                .build();
    }

    // Cập nhật dự trù kinh phí
    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_BUDGET_ESTIMATE'})")
    ApiResponse<BudgetEstimateResponse> updateBudgetEstimate(@RequestParam String id,
                                                         @RequestBody @Valid BudgetEstimateRequest request) {
        return ApiResponse.<BudgetEstimateResponse>builder()
                .code(1000)
                .result(budgetEstimateService.update(id, request))
                .build();
    }

    // Xoá dự trù kinh phí
    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_BUDGET_ESTIMATE'})")
    ApiResponse<Void> deleteBudgetEstimate(@RequestParam String id) {
        budgetEstimateService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
