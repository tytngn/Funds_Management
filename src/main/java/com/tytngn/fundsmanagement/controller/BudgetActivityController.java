package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.BudgetActivityRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.BudgetActivityResponse;
import com.tytngn.fundsmanagement.service.BudgetActivityService;
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
@RequestMapping("/budgetActivities")
public class BudgetActivityController {

    BudgetActivityService budgetActivityService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_BUDGET_ACTIVITY'})")
    ApiResponse<BudgetActivityResponse> createBudgetActivity(@RequestBody @Valid BudgetActivityRequest request) {
        return ApiResponse.<BudgetActivityResponse>builder()
                .code(1000)
                .result(budgetActivityService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_BUDGET_ACTIVITIES'})")
    ApiResponse<List<BudgetActivityResponse>> getAllBudgetActivity() {
        return ApiResponse.<List<BudgetActivityResponse>>builder()
                .code(1000)
                .result(budgetActivityService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_BUDGET_ACTIVITY'})")
    ApiResponse<BudgetActivityResponse> updateBudgetActivity(@RequestParam String id,
                                                      @RequestBody @Valid BudgetActivityRequest request) {
        return ApiResponse.<BudgetActivityResponse>builder()
                .code(1000)
                .result(budgetActivityService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_BUDGET_ACTIVITY'})")
    ApiResponse<Void> deleteBudgetActivity(@RequestParam String id) {
        budgetActivityService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
