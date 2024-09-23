package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.PaymentReqRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentReqResponse;
import com.tytngn.fundsmanagement.entity.BudgetActivity;
import com.tytngn.fundsmanagement.entity.PaymentReq;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.PaymentReqMapper;
import com.tytngn.fundsmanagement.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentReqService {

    PaymentReqRepository paymentReqRepository;
    PaymentReqMapper paymentReqMapper;

    UserRepository userRepository;
    PaymentCategoryRepository paymentCategoryRepository;
    BudgetActivityRepository budgetActivityRepository;
    SecurityExpression securityExpression;

    @Transactional
    public PaymentReqResponse create(PaymentReqRequest request) {

        // Tạo đề nghị thanh toán
        PaymentReq paymentReq = paymentReqMapper.toPaymentReq(request);
        paymentReq.setAmount(0.0);
        paymentReq.setStatus(1);
        paymentReq.setCreateDate(LocalDateTime.now());

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();
        // người thực hiện đề nghị thanh toán
        var user = userRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        paymentReq.setUser(user);

        // loại danh mục thanh toán
        var category = paymentCategoryRepository.findById(request.getCategory()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setCategory(category);

        paymentReq = paymentReqRepository.save(paymentReq);

        return paymentReqMapper.toPaymentReqResponse(paymentReq);
    }

    // Tạo đề nghị thanh toán khi hoạt động dự trù ở trạng thái hoàn thành
    @Transactional
    public PaymentReqResponse createPaymentReqFromBudgetActivities(PaymentReqRequest request){

        // Lấy danh sách các BudgetActivity với trạng thái hoàn thành
        List<BudgetActivity> budgetActivities = budgetActivityRepository.findByStatus(1);
        if (budgetActivities.isEmpty())
            throw new AppException(ErrorCode.BUDGET_ACTIVITY_NOT_EXISTS);

        // Tạo đối tượng PaymentReq mới
        PaymentReq paymentReq = paymentReqMapper.toPaymentReq(request);

        // Tính tổng số tiền từ tất cả các BudgetActivity
        double totalAmount = budgetActivities.stream()
                .mapToDouble(BudgetActivity::getAmount)
                .sum();

        paymentReq.setAmount(totalAmount);
        paymentReq.setStatus(1);
        paymentReq.setCreateDate(LocalDateTime.now());

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();
        // người thực hiện đề nghị thanh toán
        var user = userRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        paymentReq.setUser(user);

        // loại danh mục thanh toán
        var category = paymentCategoryRepository.findById(request.getCategory()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setCategory(category);

        paymentReq = paymentReqRepository.save(paymentReq);

        return paymentReqMapper.toPaymentReqResponse(paymentReq);
    }

    public List<PaymentReqResponse> getAll() {

        var paymentReq = paymentReqRepository.findAll()
                .stream()
                .map(paymentRequest -> paymentReqMapper.toPaymentReqResponse(paymentRequest))
                .toList();

        return paymentReq;
    }

    @Transactional
    public PaymentReqResponse update(String id, PaymentReqRequest request) {

        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        // cập nhật đề nghị thanh toán
        paymentReqMapper.updatePaymentReq(paymentReq, request);

        paymentReq.setUpdateDate(LocalDateTime.now());

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();
        // người thực hiện giao dịch
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        paymentReq.setUser(user);

        // loại danh mục thanh toán
        var category = paymentCategoryRepository.findById(request.getCategory()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setCategory(category);

        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }

    // Tạo đề nghị thanh toán khi hoạt động dự trù ở trạng thái hoàn thành
    @Transactional
    public PaymentReqResponse updatePaymentReqFromBudgetActivities(String id, PaymentReqRequest request) {

        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        // cập nhật đề nghị thanh toán
        paymentReqMapper.updatePaymentReq(paymentReq, request);

        paymentReq.setUpdateDate(LocalDateTime.now());

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();
        // người thực hiện giao dịch
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        paymentReq.setUser(user);

        // loại danh mục thanh toán
        var category = paymentCategoryRepository.findById(request.getCategory()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setCategory(category);

        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }

    @Transactional
    public void delete(String id) {

        var paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        paymentReq.setUser(null);
        paymentReq.setCategory(null);

        paymentReqRepository.deleteById(id);
    }
}
