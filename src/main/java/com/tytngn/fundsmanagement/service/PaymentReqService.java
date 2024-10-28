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
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
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

    // Tạo đề nghị thanh toán
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

    // Lấy danh sách tất cả đề nghị thanh toán
    public List<PaymentReqResponse> getAll() {

        var paymentReq = paymentReqRepository.findAll()
                .stream()
                .map(paymentRequest -> paymentReqMapper.toPaymentReqResponse(paymentRequest))
                .toList();

        return paymentReq;
    }

    // Lấy danh sách đề nghị thanh toán theo bộ lọc (theo loại thanh toán, thời gian, trạng thái, phòng ban, cá nhân)
    public List<PaymentReqResponse> filterPaymentRequests(String categoryId, String startDate, String endDate,
                                                          Integer status, String departmentId, String userId)
    {
        // Chuyển đổi startDate và endDate thành kiểu LocalDate nếu không null
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime start = null;
        LocalDateTime end = null;

        // Chuyển đổi tham số ngày tháng sang LocalDateTime
        try {
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDateTime.parse(startDate + "T00:00:00");
            }
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDateTime.parse(endDate + "T23:59:59");
            }
        } catch (DateTimeParseException e) {
            // Xử lý lỗi định dạng ngày tháng
            throw new AppException(ErrorCode.DATA_INVALID);
        }

        List<PaymentReq> paymentRequests = paymentReqRepository.filterPaymentRequests(categoryId, start, end, status, departmentId, userId);
        return paymentRequests.stream()
                .map(paymentReqMapper::toPaymentReqResponse)
                .sorted(Comparator.comparing(PaymentReqResponse::getCreateDate).reversed())
                .toList();
    }

    // Lấy thông tin đề nghị thanh toán theo Id
    public PaymentReqResponse getById(String id) {
        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS)));
    }

    // Cập nhật đề nghị thanh toán
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

    // Cập nhật đề nghị thanh toán khi hoạt động dự trù ở trạng thái hoàn thành
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

    // Gửi đề nghị thanh toán (chuyển sang trạng thái chờ duyệt)
    @Transactional
    public PaymentReqResponse sendPaymentRequest(String id) {

        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái hiện tại (chỉ cho phép gửi nếu trạng thái là 1)
        if (paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_SENDABLE);
        }

        // Đổi trạng thái thành 2 (đang chờ xác nhận)
        paymentReq.setStatus(2);
        paymentReq.setUpdateDate(LocalDateTime.now());

        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }

    // Xác nhận đề nghị thanh toán (trạng thái đã duyệt hoặc từ chối)
    @Transactional
    public PaymentReqResponse confirmPaymentRequest(String id, boolean isApproved) {

        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái hiện tại (chỉ cho phép xác nhận nếu trạng thái là 2)
        if (paymentReq.getStatus() != 2) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_CONFIRMABLE);
        }

        // Nếu được chấp nhận, đổi trạng thái thành 3 (đã duyệt)
        if (isApproved) {
            paymentReq.setStatus(3);
        }
        // Nếu bị từ chối, đổi trạng thái thành 0 (từ chối)
        else {
            paymentReq.setStatus(0);
        }

        paymentReq.setUpdateDate(LocalDateTime.now());

        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }

    // Xoá đề nghị thanh toán
    @Transactional
    public void delete(String id) {

        var paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // kiểm tra trạng thái của đề nghị thanh toán
        if(paymentReq.getStatus() != 1)
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);

        // Kiểm tra xem có hóa đơn nào liên quan không
        if (!paymentReq.getInvoices().isEmpty()) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_HAS_INVOICES);
        }

        paymentReq.setUser(null);
        paymentReq.setCategory(null);

        paymentReqRepository.deleteById(id);
    }
}
