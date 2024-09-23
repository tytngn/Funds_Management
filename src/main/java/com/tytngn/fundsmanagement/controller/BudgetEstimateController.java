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

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/budgetEstimates")
public class BudgetEstimateController {

    BudgetEstimateService budgetEstimateService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_BUDGET_ESTIMATE'})")
    ApiResponse<BudgetEstimateResponse> createBudgetEstimate(@RequestBody @Valid BudgetEstimateRequest request) {
        return ApiResponse.<BudgetEstimateResponse>builder()
                .code(1000)
                .result(budgetEstimateService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_BUDGET_ESTIMATES'})")
    ApiResponse<List<BudgetEstimateResponse>> getAllBudgetEstimates() {
        return ApiResponse.<List<BudgetEstimateResponse>>builder()
                .code(1000)
                .result(budgetEstimateService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_BUDGET_ESTIMATE'})")
    ApiResponse<BudgetEstimateResponse> updateBudgetEstimate(@RequestParam String id,
                                                         @RequestBody @Valid BudgetEstimateRequest request) {
        return ApiResponse.<BudgetEstimateResponse>builder()
                .code(1000)
                .result(budgetEstimateService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_BUDGET_ESTIMATE'})")
    ApiResponse<Void> deleteBudgetEstimate(@RequestParam String id) {
        budgetEstimateService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
