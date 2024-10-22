package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.BudgetEstimateRequest;
import com.tytngn.fundsmanagement.dto.response.BudgetEstimateResponse;
import com.tytngn.fundsmanagement.entity.BudgetEstimate;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.BudgetEstimateMapper;
import com.tytngn.fundsmanagement.repository.BudgetEstimateRepository;
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BudgetEstimateService {

    BudgetEstimateRepository budgetEstimateRepository;
    BudgetEstimateMapper budgetEstimateMapper;

    UserRepository userRepository;
    FundRepository fundRepository;
    SecurityExpression securityExpression;

    // Tạo dự trù kinh phí
    @Transactional
    public BudgetEstimateResponse create(BudgetEstimateRequest request) {

        BudgetEstimate budgetEstimate = budgetEstimateMapper.toBudgetEstimate(request);
        budgetEstimate.setStatus(1);
        budgetEstimate.setAmount(0.0);
        budgetEstimate.setCreatedDate(LocalDate.now());

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();
        // người thực hiện tạo dự trù ngân sách
        var user = userRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        budgetEstimate.setUser(user);

        // quỹ được dự trù kinh phí
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));
        budgetEstimate.setFund(fund);
        budgetEstimate.setFundName(fund.getFundName());

        budgetEstimate = budgetEstimateRepository.save(budgetEstimate);

        return budgetEstimateMapper.toBudgetEstimateResponse(budgetEstimate);
    }

    // Lấy danh sách tất cả dự trù kinh phí
    public List<BudgetEstimateResponse> getAll() {

        var budgetEstimates = budgetEstimateRepository.findAll()
                .stream()
                .map(budgetEstimate -> budgetEstimateMapper.toBudgetEstimateResponse(budgetEstimate))
                .toList();

        return budgetEstimates;
    }

    // Lấy danh sách dự trù kinh phí theo bộ lọc
    public List<BudgetEstimateResponse> filterBudgetEstimates(String fundId, LocalDate start, LocalDate end, Integer status, String departmentId, String userId) {

        List<BudgetEstimate> budgetEstimates = budgetEstimateRepository.filterBudgetEstimates(fundId, start, end, status, departmentId, userId);

        return budgetEstimates.stream()
                .map(budgetEstimateMapper::toBudgetEstimateResponse)
                .toList();
    }

    // Lấy dự trù kinh phí theo Id
    public BudgetEstimateResponse getBudgetEstimateById(String id) {

        BudgetEstimate budgetEstimate = budgetEstimateRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EXISTS));

        return budgetEstimateMapper.toBudgetEstimateResponse(budgetEstimate);
    }

    // Cập nhật dự trù kinh phí
    @Transactional
    public BudgetEstimateResponse update(String id, BudgetEstimateRequest request) {

        BudgetEstimate budgetEstimate = budgetEstimateRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EXISTS));

        budgetEstimateMapper.updateBudgetEstimate(budgetEstimate, request);
        budgetEstimate.setUpdatedDate(LocalDate.now());

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();
        // người thực hiện tạo dự trù kinh phí
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        budgetEstimate.setUser(user);

        // quỹ được dự trù kinh phí
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));
        budgetEstimate.setFund(fund);
        budgetEstimate.setFundName(fund.getFundName());


        return budgetEstimateMapper.toBudgetEstimateResponse(budgetEstimateRepository.save(budgetEstimate));
    }

    // Xoá dự trù kinh phí
    @Transactional
    public void delete(String id) {

        var budgetEstimate = budgetEstimateRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EXISTS));

        budgetEstimate.setUser(null);

        budgetEstimateRepository.deleteById(id);
    }
}
