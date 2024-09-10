package com.tytngn.fundsmanagement.controller;

import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.ApiResponse;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.service.FundService;
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
@RequestMapping("/funds")
public class FundController {

    FundService fundService;

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_FUND'})")
    ApiResponse<FundResponse> createFund(@RequestBody @Valid FundRequest request) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_FUNDS'})")
    ApiResponse<List<FundResponse>> getAllFunds() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundService.getAll())
                .build();
    }

    @PutMapping
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND'})")
    ApiResponse<FundResponse> updateFund(@RequestParam String id, @RequestBody @Valid FundRequest request) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.update(id, request))
                .build();
    }

    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_FUND'})")
    ApiResponse<Void> deleteFund(@RequestParam String id) {
        fundService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
