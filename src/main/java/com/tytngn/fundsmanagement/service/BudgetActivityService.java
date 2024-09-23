package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.BudgetActivityRequest;
import com.tytngn.fundsmanagement.dto.response.BudgetActivityResponse;
import com.tytngn.fundsmanagement.entity.BudgetActivity;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.BudgetActivityMapper;
import com.tytngn.fundsmanagement.repository.BudgetActivityRepository;
import com.tytngn.fundsmanagement.repository.BudgetEstimateRepository;
import com.tytngn.fundsmanagement.repository.PaymentReqRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BudgetActivityService {

    BudgetActivityRepository budgetActivityRepository;
    BudgetActivityMapper budgetActivityMapper;

    BudgetEstimateRepository budgetEstimateRepository;

    public BudgetActivityResponse create(BudgetActivityRequest request) {

        // Dự trù ngân sách
        var budgetEstimate = budgetEstimateRepository.findById(request.getBudgetEstimate()).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EXISTS));

        // Nếu dự trù ngân sách ở trạng thái khác 1
        if(budgetEstimate.getStatus() != 1)
            throw new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EDITABLE);

        // Tạo hoạt động dự trù
        BudgetActivity budgetActivity = budgetActivityMapper.toBudgetActivity(request);
        budgetActivity.setStatus(0);
        budgetActivity.setBudgetEstimate(budgetEstimate);
        budgetActivity.setPaymentReq(null); // vì đang ở trạng thái chưa thực hiện nên PaymentReq sẽ là null

        budgetActivity = budgetActivityRepository.save(budgetActivity);

        return budgetActivityMapper.toBudgetActivityResponse(budgetActivity);
    }

    public List<BudgetActivityResponse> getAll() {

        var budgetActivitys = budgetActivityRepository.findAll()
                .stream()
                .map(budgetActivity -> budgetActivityMapper.toBudgetActivityResponse(budgetActivity))
                .toList();

        return budgetActivitys;
    }

    public BudgetActivityResponse update(String id, BudgetActivityRequest request) {

        //kiểm tra hoạt động dự trù có tồn tại không
        BudgetActivity budgetActivity = budgetActivityRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ACTIVITY_NOT_EXISTS));

        // Dự trù ngân sách
        var budgetEstimate = budgetEstimateRepository.findById(request.getBudgetEstimate()).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EXISTS));

        // Nếu dự trù ngân sách ở trạng thái khác 1
        if(budgetEstimate.getStatus() != 1 && budgetEstimate.getStatus() != 3){
            throw new AppException(ErrorCode.BUDGET_ESTIMATE_NOT_EDITABLE);
        }

        // Nếu dự trù ngân sách ở trạng thái 3, chỉ cho phép cập nhật thuộc tính status của budgetActivity
        if (budgetEstimate.getStatus() == 3) {
            budgetActivity.setStatus(request.getStatus());
        } else {
            // cập nhật lại hoạt động dự trù
            budgetActivity = budgetActivityMapper.toBudgetActivity(request);
            budgetActivity.setBudgetEstimate(budgetEstimate);
        }

        return budgetActivityMapper.toBudgetActivityResponse(budgetActivityRepository.save(budgetActivity));
    }

    public void delete(String id) {
        //kiểm tra hoạt động dự trù có tồn tại không
        var budgetActivity = budgetActivityRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BUDGET_ACTIVITY_NOT_EXISTS));

        var budgetEstimate = budgetActivity.getBudgetEstimate();

        // kiểm tra trạng thái của dự trù ngân sách
        if(budgetEstimate != null && budgetEstimate.getStatus() != 1)
            throw new AppException(ErrorCode.BUDGET_ACTIVITY_CANNOT_BE_DELETE);

        // lấy danh sách các hoạt động dự trù trong BudgetEstimate
        List<BudgetActivity> budgetActivities = budgetActivityRepository.findByBudgetEstimate(budgetEstimate);
        // Kiểm tra xem có phải hoạt động dự trù cuối cùng hay không
        if(budgetActivities.size() == 1)
            throw new AppException(ErrorCode.LAST_BUDGET_ACTIVITY_CANNOT_BE_DELETE);

        // Nếu không phải hoạt động dự trù cuối cùng, tiến hành xoá
        budgetActivityRepository.deleteById(id);
    }
}
