package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.FundTransactionReportResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
import com.tytngn.fundsmanagement.entity.Image;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FundTransactionMapper;
import com.tytngn.fundsmanagement.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FundTransactionService {

    FundTransactionRepository fundTransactionRepository;
    FundTransactionMapper fundTransactionMapper;

    UserRepository userRepository;
    FundRepository fundRepository;
    TransactionTypeRepository transactionTypeRepository;
    FundPermissionRepository fundPermissionRepository;
    ImageRepository imageRepository;
    SecurityExpression securityExpression;

    // Tạo giao dịch
    @Transactional
    public FundTransactionResponse create(FundTransactionRequest request) {

        // Tạo 1 giao dịch
        FundTransaction fundTransaction = fundTransactionMapper.toFundTransaction(request);
        fundTransaction.setStatus(1); // Chờ duyệt
        fundTransaction.setTransDate(LocalDateTime.now()); // Thời gian giao dịch

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
        fundTransaction.setImages(savedImages);

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();
        // người thực hiện giao dịch
        var user = userRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        fundTransaction.setUser(user);

        // quỹ được giao dịch
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));
        // Nếu quỹ ngưng hoạt động
        if(fund.getStatus() == 0) {
            throw new AppException(ErrorCode.INACTIVE_FUND);
        }
        fundTransaction.setFund(fund);

        // loại giao dịch
        var transactionType = transactionTypeRepository.findById(request.getTransactionType()).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));
        fundTransaction.setTransactionType(transactionType);

        // Kiểm tra quyền của người dùng đối với quỹ này
        var fundPermission = fundPermissionRepository.findByUserIdAndFundId(user.getId(), fund.getId());
        if (fundPermission == null) {
            throw new AppException(ErrorCode.FUND_PERMISSION_NOT_EXISTS);
        }

        // Kiểm tra quyền đóng góp quỹ
        if ((transactionType.getStatus() == 1) && !fundPermission.isCanContribute()) {
            throw new AppException(ErrorCode.NO_CONTRIBUTION_PERMISSION);
        }

        // Kiểm tra quyền rút quỹ
        if ((transactionType.getStatus() == 0) && !fundPermission.isCanWithdraw()) {
            throw new AppException(ErrorCode.NO_WITHDRAW_PERMISSION);
        }

        fundTransaction = fundTransactionRepository.save(fundTransaction);
        return fundTransactionMapper.toFundTransactionResponse(fundTransaction);
    }


    // Lấy danh sách tất cả giao dịch
    public List<FundTransactionResponse> getAll() {

        var fundTransaction = fundTransactionRepository.findAll()
                .stream()
                .map(fundTrans -> fundTransactionMapper.toFundTransactionResponse(fundTrans))
                .toList();

        return fundTransaction;
    }


    // Lấy giao dịch bằng ID
    public FundTransactionResponse getById(String id) {
        return fundTransactionMapper.toFundTransactionResponse(fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS)));
    }


    // Lấy danh sách giao dịch đóng góp theo bộ lọc (theo quỹ, loại giao dịch, thời gian, phòng ban, cá nhân, trạng thái)
    public Map<String, Object> getContributionByFilter(String fundId, String transTypeId,
                                                       String startDate, String endDate,
                                                       String departmentId, String userId,
                                                       Integer status) {

        // Chuyển đổi startDate và endDate thành kiểu LocalDateTime nếu không null
        LocalDateTime start = null;
        LocalDateTime end = null;

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

        List<FundTransaction> fundTransactions = fundTransactionRepository.filterTransactions(
                fundId, transTypeId, start, end, departmentId, userId, status);

        // Lọc các giao dịch đóng góp và tính tổng số tiền
        double totalAmount = fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 1) // Chỉ lấy loại giao dịch đóng góp
                .mapToDouble(FundTransaction::getAmount)
                .sum();

        // Map danh sách giao dịch đóng góp sang DTO và sắp xếp theo ngày giao dịch mới nhất
        List<FundTransactionResponse> responses = fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 1) // Chỉ lấy loại giao dịch đóng góp
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }



    // Lấy danh sách giao dịch đóng góp của một người dùng theo bộ lọc và tính tổng số tiền
    public Map<String, Object> getUserContributionsByFilter(String fundId, String transTypeId,
                                                            String startDate, String endDate,
                                                            Integer status) {
        // Lấy userId người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

        LocalDateTime start = null;
        LocalDateTime end = null;

        try {
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDateTime.parse(startDate + "T00:00:00");
            }
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDateTime.parse(endDate + "T23:59:59");
            }
        } catch (DateTimeParseException e) {
            throw new AppException(ErrorCode.DATA_INVALID);
        }

        // Gọi repository để lấy danh sách giao dịch theo bộ lọc
        List<FundTransaction> fundTransactions = fundTransactionRepository.filterTransactions(
                fundId, transTypeId, start, end, null, userId, status);

        // Tính tổng số tiền đóng góp
        double totalAmount = fundTransactions.stream()
                .mapToDouble(FundTransaction::getAmount)
                .sum();

        // Map danh sách giao dịch sang DTO và thêm tổng số tiền vào response
        List<FundTransactionResponse> responses = fundTransactions.stream()
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Lấy báo cáo quỹ của một người dùng theo bộ lọc
//    public List<FundTransactionReportResponse> getUserFundReport(String startDate, String endDate) {
//        // Lấy userId người dùng đang đăng nhập
//        String userId = securityExpression.getUserId();
//
//        LocalDateTime start = null;
//        LocalDateTime end = null;
//
//        try {
//            if (startDate != null && !startDate.isEmpty()) {
//                start = LocalDateTime.parse(startDate + "T00:00:00");
//            }
//            if (endDate != null && !endDate.isEmpty()) {
//                end = LocalDateTime.parse(endDate + "T23:59:59");
//            }
//        } catch (DateTimeParseException e) {
//            throw new AppException(ErrorCode.DATA_INVALID);
//        }
//
//        List<FundTransactionReportResponse> reportData = fundTransactionRepository.getUserFundReport(userId, start, end);
//
//        return reportData;
//    }
    public List<FundTransactionReportResponse> getUserFundReport(String startDate, String endDate, Integer year, Integer month) {
        // Lấy userId người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

        LocalDateTime start = null;
        LocalDateTime end = null;

        if (year == null && month == null) {
            try {
                if (startDate != null && !startDate.isEmpty()) {
                    start = LocalDateTime.parse(startDate + "T00:00:00");
                }
                if (endDate != null && !endDate.isEmpty()) {
                    end = LocalDateTime.parse(endDate + "T23:59:59");
                }
            } catch (DateTimeParseException e) {
                throw new AppException(ErrorCode.DATA_INVALID);
            }
        }

        // Lấy dữ liệu từ repository
        List<FundTransactionReportResponse> reportData = fundTransactionRepository.getUserFundReport(userId, year, month, start, end);

        // Sắp xếp theo năm và tháng
        List<FundTransactionReportResponse> sortedResponses = reportData.stream()
                .sorted(Comparator.comparing(FundTransactionReportResponse::getYear)
                        .reversed()
                        .thenComparing(Comparator.comparing(FundTransactionReportResponse::getMonth).reversed()))
                .toList();

        return sortedResponses;
    }


    // Lấy danh sách giao dịch rút quỹ theo bộ lọc (theo quỹ, loại giao dịch, thời gian, phòng ban, cá nhân, trạng thái)
    public Map<String, Object> getWithdrawByFilter(String fundId, String transTypeId,
                                                   String startDate, String endDate,
                                                   String departmentId, String userId,
                                                   Integer status) {

        // Chuyển đổi startDate và endDate thành kiểu LocalDateTime nếu không null
        LocalDateTime start = null;
        LocalDateTime end = null;

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

        List<FundTransaction> fundTransactions = fundTransactionRepository.filterTransactions(
                fundId, transTypeId, start, end, departmentId, userId, status);

        // Tính tổng số tiền của các giao dịch rút quỹ
        double totalAmount = fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 0) // Chỉ lấy loại giao dịch rút quỹ
                .mapToDouble(FundTransaction::getAmount)
                .sum();

        // Map danh sách giao dịch rút quỹ sang DTO và sắp xếp theo ngày giao dịch mới nhất
        List<FundTransactionResponse> responses = fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 0) // Chỉ lấy loại giao dịch rút quỹ
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Lấy danh sách giao dịch rút quỹ của một người dùng theo bộ lọc và tính tổng số tiền
    public Map<String, Object> getUserWithdrawalsByFilter(String fundId, String transTypeId,
                                                          String startDate, String endDate,
                                                          Integer status) {
        String userId = securityExpression.getUserId();

        LocalDateTime start = null;
        LocalDateTime end = null;

        try {
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDateTime.parse(startDate + "T00:00:00");
            }
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDateTime.parse(endDate + "T23:59:59");
            }
        } catch (DateTimeParseException e) {
            throw new AppException(ErrorCode.DATA_INVALID);
        }

        // Gọi repository để lấy danh sách giao dịch rút quỹ theo bộ lọc
        List<FundTransaction> fundTransactions = fundTransactionRepository.filterTransactions(
                fundId, transTypeId, start, end, null, userId, status);

        // Tính tổng số tiền rút quỹ
        double totalAmount = fundTransactions.stream()
                .mapToDouble(FundTransaction::getAmount)
                .sum();

        // Map danh sách giao dịch sang DTO và thêm tổng số tiền vào response
        List<FundTransactionResponse> responses = fundTransactions.stream()
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Cập nhật giao dịch
    @Transactional
    public FundTransactionResponse update(String id, FundTransactionRequest request) {
        // Kiểm tra giao dịch có tồn tại không
        FundTransaction fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_TRANSACTION_NOT_EXISTS));

        // Cập nhật giao dịch
        fundTransactionMapper.updateFundTransaction(fundTransaction, request);
        fundTransaction.setTransDate(LocalDateTime.now()); // thời gian giao dịch

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
        fundTransaction.setImages(savedImages);

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();
        // người thực hiện giao dịch
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        fundTransaction.setUser(user);

        // quỹ được giao dịch
        var fund = fundRepository.findById(request.getFund()).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));
        // Nếu quỹ ngưng hoạt động
        if(fund.getStatus() == 0)
            throw new AppException(ErrorCode.INACTIVE_FUND);
        fundTransaction.setFund(fund);

        // loại giao dịch
        var transactionType = transactionTypeRepository.findById(request.getTransactionType()).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));
        fundTransaction.setTransactionType(transactionType);

        // Kiểm tra quyền của người dùng đối với quỹ này
        var fundPermission = fundPermissionRepository.findByUserIdAndFundId(user.getId(), fund.getId());
        if (fundPermission == null) {
            throw new AppException(ErrorCode.FUND_PERMISSION_NOT_EXISTS);
        }

        // Kiểm tra quyền đóng góp quỹ
        if ((transactionType.getStatus() == 1) && !fundPermission.isCanContribute()) {
            throw new AppException(ErrorCode.NO_CONTRIBUTION_PERMISSION);
        }

        // Kiểm tra quyền rút quỹ
        if ((transactionType.getStatus() == 0) && !fundPermission.isCanWithdraw()) {
            throw new AppException(ErrorCode.NO_WITHDRAW_PERMISSION);
        }

        return fundTransactionMapper.toFundTransactionResponse(fundTransactionRepository.save(fundTransaction));
    }

    // Duyệt giao dịch
    @Transactional
    public FundTransactionResponse approveTransaction(String id) {
        FundTransaction fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_TRANSACTION_NOT_EXISTS));

        // Chỉ duyệt các giao dịch đang chờ duyệt
        if (fundTransaction.getStatus() != 1) {
            throw new AppException(ErrorCode.TRANSACTION_ALREADY_PROCESSED);
        }

        var fund = fundTransaction.getFund();
        var transactionType = fundTransaction.getTransactionType();

        // Nếu là giao dịch đóng góp quỹ
        if (transactionType.getStatus() == 1) {
            fund.setBalance(fund.getBalance() + fundTransaction.getAmount());
        }

        // nếu là giao dịch rút quỹ
        if (transactionType.getStatus() == 0) {
            // nếu số dư không đủ
            if (fund.getBalance() < fundTransaction.getAmount()) {
                throw new AppException(ErrorCode.INSUFFICIENT_FUNDS_TRANSACTION);
            }
            fund.setBalance(fund.getBalance() - fundTransaction.getAmount());
        }

        fundTransaction.setStatus(2); // Đánh dấu đã duyệt
        fundTransaction.setConfirmDate(LocalDateTime.now());
        fundTransaction = fundTransactionRepository.save(fundTransaction);
        return fundTransactionMapper.toFundTransactionResponse(fundTransaction);
    }

    // Từ chối giao dịch
    @Transactional
    public FundTransactionResponse rejectTransaction(String id) {
        FundTransaction fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_TRANSACTION_NOT_EXISTS));

        // Chỉ từ chối các giao dịch đang chờ duyệt
        if (fundTransaction.getStatus() != 1) {
            throw new AppException(ErrorCode.TRANSACTION_ALREADY_PROCESSED);
        }

        // Đặt trạng thái thành từ chối
        fundTransaction.setStatus(0); // Từ chối
        fundTransaction.setConfirmDate(LocalDateTime.now());

        fundTransaction = fundTransactionRepository.save(fundTransaction);
        return fundTransactionMapper.toFundTransactionResponse(fundTransaction);
    }


    // Xoá giao dịch
    @Transactional
    public void delete(String id) {
        var fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));

        fundTransaction.setUser(null);
        fundTransaction.setFund(null);
        fundTransaction.setTransactionType(null);

        fundTransactionRepository.deleteById(id);
    }
}
