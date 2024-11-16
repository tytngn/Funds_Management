package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.PaymentReqRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentReqResponse;
import com.tytngn.fundsmanagement.entity.Image;
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
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentReqService {

    PaymentReqRepository paymentReqRepository;
    PaymentReqMapper paymentReqMapper;

    UserRepository userRepository;
    FundRepository fundRepository;
    ImageRepository imageRepository;
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

        // quỹ
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setFund(fund);

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


    // Lấy danh sách đề nghị thanh toán theo bộ lọc
    public Map<String, Object> filterPaymentRequests(String fundId, String startDate, String endDate,
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

        List<PaymentReq> paymentRequests = paymentReqRepository.filterPaymentRequests(fundId, start, end, status, departmentId, userId);

        // Tính tổng số tiền của các đề nghị thanh toán
        double totalAmount = paymentRequests.stream()
                .mapToDouble(PaymentReq::getAmount)
                .sum();

        // Map danh sách đề nghị thanh toán sang DTO và sắp xếp theo ngày tạo mới nhất
        List<PaymentReqResponse> responses = paymentRequests.stream()
                .map(paymentReqMapper::toPaymentReqResponse)
                .sorted(Comparator.comparing(PaymentReqResponse::getCreateDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("paymentRequests", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Lấy danh sách đề nghị thanh toán theo bộ lọc và phải thuộc quỹ của người dùng tạo ra
    public Map<String, Object> filterPaymentRequestsByTreasurer(String fundId, String startDate, String endDate,
                                                     Integer status, String departmentId, String userId)
    {
        String id = securityExpression.getUserId();

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

        List<PaymentReq> paymentRequests = paymentReqRepository.filterPaymentRequestsByTreasurer(fundId, start, end, status, departmentId, userId, id);

        // Tính tổng số tiền của các đề nghị thanh toán
        double totalAmount = paymentRequests.stream()
                .mapToDouble(PaymentReq::getAmount)
                .sum();

        // Map danh sách đề nghị thanh toán sang DTO và sắp xếp theo ngày tạo mới nhất
        List<PaymentReqResponse> responses = paymentRequests.stream()
                .map(paymentReqMapper::toPaymentReqResponse)
                .sorted(Comparator.comparing(PaymentReqResponse::getCreateDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("paymentRequests", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Lấy danh sách đề nghị thanh toán của một người dùng theo bộ lọc
    public Map<String, Object> getUserPaymentRequestsByFilter(String fundId, String startDate, String endDate, Integer status) {
        // Lấy userId người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

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

        // Gọi repository để lấy danh sách đề nghị thanh toán theo bộ lọc
        List<PaymentReq> paymentRequests = paymentReqRepository.filterPaymentRequests(
                fundId, start, end, status, null, userId);

        // Tính tổng số tiền của các đề nghị thanh toán
        double totalAmount = paymentRequests.stream()
                .mapToDouble(PaymentReq::getAmount)
                .sum();

        // Map danh sách đề nghị thanh toán sang DTO và sắp xếp theo ngày tạo mới nhất
        List<PaymentReqResponse> responses = paymentRequests.stream()
                .map(paymentReqMapper::toPaymentReqResponse)
                .sorted(Comparator.comparing(PaymentReqResponse::getCreateDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("paymentRequests", responses);
        result.put("totalAmount", totalAmount);

        return result;
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

        // Kiểm tra trạng thái của đề nghị thanh toán (chỉ cho phép nếu trạng thái là 0 hoặc 1)
        if (paymentReq.getStatus() != 0 && paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
        }

        // Nếu trạng thái là 0, kiểm tra số lần cập nhật trước đó
        if (paymentReq.getStatus() == 0) {
            int updateCount = paymentReqRepository.countByStatusAndId(0, paymentReq.getId());
            if (updateCount > 3) {
                throw new AppException(ErrorCode.PAYMENT_REQUEST_UPDATE_LIMIT_EXCEEDED);
            }
        }

        // cập nhật đề nghị thanh toán
        paymentReqMapper.updatePaymentReq(paymentReq, request);
        paymentReq.setStatus(1);
        paymentReq.setUpdateDate(LocalDateTime.now());

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();
        // người thực hiện giao dịch
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        paymentReq.setUser(user);

        // quỹ
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
        paymentReq.setFund(fund);

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

        // Kiểm tra số tiền có bằng 0 không
        if (paymentReq.getAmount() <= 0) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_AMOUNT_ZERO);
        }

        int sendCount = paymentReqRepository.countByStatusAndId(2, paymentReq.getId());
        if (sendCount > 3) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_SEND_LIMIT_EXCEEDED);
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


    // Tiến hành thanh toán và cập nhật số dư quỹ
    @Transactional
    public PaymentReqResponse processPaymentRequest(String id, PaymentReqRequest request) {

        // Tìm đề nghị thanh toán
        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Kiểm tra trạng thái hiện tại (chỉ cho phép thanh toán nếu trạng thái là 3 - đã duyệt)
        if (paymentReq.getStatus() != 3) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_PAYABLE);
        }

        // Tải lên nhiều ảnh minh chứng
        List<Image> savedImages = new ArrayList<>();
        for (int i = 0; i < request.getImages().size(); i++) {
            byte[] file = request.getImages().get(i);
            String fileName = request.getFileNames().get(i);  // Lấy tên file tương ứng

            Image image = new Image();
            image.setImage(file); // Lưu dữ liệu ảnh dưới dạng byte[]
            image.setFileName(fileName); // Lưu tên file ảnh
            savedImages.add(imageRepository.save(image));
        }
        paymentReq.setImages(savedImages);

        // Lấy quỹ liên kết với đề nghị thanh toán
        var fund = paymentReq.getFund();
        if (fund == null) {
            throw new AppException(ErrorCode.FUND_NOT_EXISTS);
        }

        // Kiểm tra số dư quỹ có đủ để thanh toán không
        if (fund.getBalance() < paymentReq.getAmount()) {
            throw new AppException(ErrorCode.INSUFFICIENT_FUNDS_TRANSACTION);
        }

        // Trừ số tiền thanh toán từ quỹ
        fund.setBalance(fund.getBalance() - paymentReq.getAmount());
        fundRepository.save(fund);

        // Cập nhật trạng thái đề nghị thanh toán thành 4 - đã thanh toán
        paymentReq.setStatus(4);
        paymentReq.setUpdateDate(LocalDateTime.now());

        // Lưu thay đổi và trả về phản hồi
        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }


    // Xác nhận đã nhận tiền (trạng thái đã nhận - status = 5)
    @Transactional
    public PaymentReqResponse confirmReceipt(String id) {

        // Tìm đề nghị thanh toán
        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Kiểm tra trạng thái hiện tại (chỉ cho phép chuyển sang "đã nhận" nếu trạng thái là 4 - đã thanh toán)
        if (paymentReq.getStatus() != 4) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_RECEIVABLE);
        }

        // Cập nhật trạng thái đề nghị thanh toán thành 5 - đã nhận
        paymentReq.setStatus(5);
        paymentReq.setUpdateDate(LocalDateTime.now());

        // Lưu thay đổi và trả về phản hồi
        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
    }


    // Xoá đề nghị thanh toán
    @Transactional
    public void delete(String id) {

        // Tìm đề nghị thanh toán
        var paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));

        // Kiểm tra trạng thái của đề nghị thanh toán (chỉ cho phép xoá nếu trạng thái là 1 - chưa xử lý)
        if (paymentReq.getStatus() != 1) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
        }

        // Xoá các liên kết khác
        paymentReq.setUser(null);
        paymentReq.setFund(null);

        paymentReqRepository.deleteById(id);
    }



    // Tạo đề nghị thanh toán khi hoạt động dự trù ở trạng thái hoàn thành
//    @Transactional
//    public PaymentReqResponse createPaymentReqFromBudgetActivities(PaymentReqRequest request){
//
//        // Lấy danh sách các BudgetActivity với trạng thái hoàn thành
//        List<BudgetActivity> budgetActivities = budgetActivityRepository.findByStatus(1);
//        if (budgetActivities.isEmpty())
//            throw new AppException(ErrorCode.BUDGET_ACTIVITY_NOT_EXISTS);
//
//        // Tạo đối tượng PaymentReq mới
//        PaymentReq paymentReq = paymentReqMapper.toPaymentReq(request);
//
//        // Tính tổng số tiền từ tất cả các BudgetActivity
//        double totalAmount = budgetActivities.stream()
//                .mapToDouble(BudgetActivity::getAmount)
//                .sum();
//
//        paymentReq.setAmount(totalAmount);
//        paymentReq.setStatus(1);
//        paymentReq.setCreateDate(LocalDateTime.now());
//
//        // Lấy thông tin người dùng đang đăng nhập
//        String id = securityExpression.getUserId();
//        // người thực hiện đề nghị thanh toán
//        var user = userRepository.findById(id).orElseThrow(() ->
//                new AppException(ErrorCode.USER_NOT_EXISTS));
//        paymentReq.setUser(user);
//
//        // quỹ
//        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
//                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
//        paymentReq.setFund(fund);
//
//        paymentReq = paymentReqRepository.save(paymentReq);
//
//        return paymentReqMapper.toPaymentReqResponse(paymentReq);
//    }

    // Cập nhật đề nghị thanh toán khi hoạt động dự trù ở trạng thái hoàn thành
//    @Transactional
//    public PaymentReqResponse updatePaymentReqFromBudgetActivities(String id, PaymentReqRequest request) {
//
//        PaymentReq paymentReq = paymentReqRepository.findById(id).orElseThrow(() ->
//                new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EXISTS));
//
//        // kiểm tra trạng thái của đề nghị thanh toán
//        if(paymentReq.getStatus() != 1)
//            throw new AppException(ErrorCode.PAYMENT_REQUEST_NOT_EDITABLE);
//
//        // cập nhật đề nghị thanh toán
//        paymentReqMapper.updatePaymentReq(paymentReq, request);
//
//        paymentReq.setUpdateDate(LocalDateTime.now());
//
//        // Lấy thông tin người dùng đang đăng nhập
//        String userId = securityExpression.getUserId();
//        // người thực hiện giao dịch
//        var user = userRepository.findById(userId).orElseThrow(() ->
//                new AppException(ErrorCode.USER_NOT_EXISTS));
//        paymentReq.setUser(user);
//
//        // quỹ
//        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
//                new AppException(ErrorCode.PAYMENT_CATEGORY_NOT_EXISTS));
//        paymentReq.setFund(fund);
//
//        return paymentReqMapper.toPaymentReqResponse(paymentReqRepository.save(paymentReq));
//    }
}
