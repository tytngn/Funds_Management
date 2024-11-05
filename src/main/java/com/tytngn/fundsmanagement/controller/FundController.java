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

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/funds")
public class FundController {

    FundService fundService;

    // tạo quỹ
    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'CREATE_FUND'})")
    ApiResponse<FundResponse> createFund(@RequestBody @Valid FundRequest request) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.create(request))
                .build();
    }


    // lấy danh sách tâ cả quỹ
    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_FUNDS'})")
    ApiResponse<List<FundResponse>> getAllFunds() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundService.getAll())
                .build();
    }


    // lấy quỹ theo ID
    @GetMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_BY_ID'})")
    ApiResponse<FundResponse> getFundById(@PathVariable String id) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.getById(id))
                .build();
    }


    // lấy danh sách quỹ đang hoạt động
    @GetMapping("/active")
    @PreAuthorize("@securityExpression.hasPermission({'GET_ACTIVE_FUNDS'})")
    ApiResponse<List<FundResponse>> getActiveFunds() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundService.getActiveFunds())
                .build();
    }


    // lấy danh sách quỹ theo thủ quỹ
    @GetMapping("/by-treasurer")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUNDS_BY_TREASURER'})")
    ApiResponse<List<FundResponse>> getFundsByTreasurer() {
        return ApiResponse.<List<FundResponse>>builder()
                .code(1000)
                .result(fundService.getFundsByTreasurer())
                .build();
    }


    // lấy danh sách quỹ theo bộ lọc
    @GetMapping("/filter")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUNDS_BY_FILTER'})")
    ApiResponse<Map<String, Object>> getFundsByFilter(@RequestParam(required = false) LocalDate start,
                                                      @RequestParam(required = false) LocalDate end,
                                                      @RequestParam(required = false) Integer status,
                                                      @RequestParam(required = false) String departmentId,
                                                      @RequestParam(required = false) String userId)
    {
        departmentId = (departmentId != null && !departmentId.isEmpty()) ? departmentId : null;
        userId = (userId != null && !userId.isEmpty()) ? userId : null;
        status = (status != null) ? status : null;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundService.filterFunds(start, end, status, departmentId, userId))
                .build();
    }


    // Lấy danh sách quỹ do người dùng làm thủ quỹ theo bộ lọc
    @GetMapping("/filter/by-treasurer")
    @PreAuthorize("@securityExpression.hasPermission({'FILTER_FUNDS_BY_TREASURER'})")
    ApiResponse<Map<String, Object>> filterFundsByTreasurer(@RequestParam(required = false) LocalDate start,
                                                      @RequestParam(required = false) LocalDate end,
                                                      @RequestParam(required = false) Integer status)
    {
        status = (status != null) ? status : null;

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundService.filterFundsByTreasurer(start, end, status))
                .build();
    }


    // lấy báo cáo tổng quan quỹ
    @GetMapping("/overview")
    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_OVERVIEW'})")
    ApiResponse<Map<String, Object>> getFundOverviewReport(@RequestParam(required = false) Integer year,
                                                           @RequestParam(required = false) Integer month,
                                                           @RequestParam(required = false) LocalDate start,
                                                           @RequestParam(required = false) LocalDate end) {

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .result(fundService.getFundOverview(year, month, start, end))
                .build();
    }


    // Báo cáo chi tiết quỹ
//    @GetMapping("/report")
//    @PreAuthorize("@securityExpression.hasPermission({'GET_FUND_REPORT_FILTER'})")
//    ApiResponse<List<FundReportResponse>> getFundReportByFilter(@RequestParam(required = false) Integer year,
//                                                                @RequestParam(required = false) Integer month,
//                                                                @RequestParam(required = false) LocalDate start,
//                                                                @RequestParam(required = false) LocalDate end) {
//        return ApiResponse.<List<FundReportResponse>>builder()
//                .code(1000)
//                .result(fundService.generateFundReport(year, month, start, end))
//                .build();
//    }


    // cập nhật quỹ
    @PutMapping("/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'UPDATE_FUND'})")
    ApiResponse<FundResponse> updateFund(@PathVariable String id, @RequestBody @Valid FundRequest request) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.update(id, request))
                .build();
    }


    // Chuyển thủ quỹ
    @PutMapping("/assign-treasurer/{id}/{userId}")
    @PreAuthorize("@securityExpression.hasPermission({'ASSIGN_TREASURER'})")
    ApiResponse<FundResponse> assignTreasurer(@PathVariable String id, @PathVariable String userId) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.assignTreasurer(id, userId))
                .build();
    }


    // Vô hiệu hoá quỹ
    @PutMapping("/disable/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'DISABLE_FUND'})")
    ApiResponse<FundResponse> disableFund(@PathVariable String id) {
        return ApiResponse.<FundResponse>builder()
                .code(1000)
                .result(fundService.disable(id))
                .build();
    }


    // xoá quỹ
    @DeleteMapping()
    @PreAuthorize("@securityExpression.hasPermission({'DELETE_FUND'})")
    ApiResponse<Void> deleteFund(@RequestParam String id) {
        fundService.delete(id);
        return ApiResponse.<Void>builder().code(1000).build();
    }
}
