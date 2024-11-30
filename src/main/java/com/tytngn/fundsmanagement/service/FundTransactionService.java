package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentReportResponse;
import com.tytngn.fundsmanagement.dto.response.TransactionReportResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
import com.tytngn.fundsmanagement.entity.Image;
import com.tytngn.fundsmanagement.entity.User;
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

import java.text.Collator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
    PaymentReqRepository paymentReqRepository;
    ImageRepository imageRepository;
    TelegramService telegramService;
    SecurityExpression securityExpression;
    Collator vietnameseCollator;

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

        // Nếu người dùng không phải ADMIN
        if (user.getStatus() != 9999){
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
        }

        // Lưu giao dịch
        fundTransaction = fundTransactionRepository.save(fundTransaction);

        // Gửi thông báo telegram
        if (transactionType.getStatus() == 1) {
            var treasurer = userRepository.findById(fund.getUser().getId()).orElseThrow(() ->
                    new AppException(ErrorCode.USER_NOT_EXISTS)); // người nhận
            // Định dạng nội dung thông báo
            String notificationMessage = String.format(
                    """
                    [THÔNG BÁO GIAO DỊCH ĐÓNG GÓP QUỸ]
                        - Người thực hiện: %s
                        - Số tiền giao dịch: %, .2f VNĐ
                        - Quỹ: %s
                        - Thời gian: %s 
                        - Trạng thái: Chờ duyệt
                                        
                        Vui lòng kiểm tra và xử lý!
                    """,
                    user.getFullname(),
                    request.getAmount(),
                    fund.getFundName(),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"))
            );
            log.info(treasurer.getFullname());
            log.info(treasurer.getTelegramId().toString());
            telegramService.sendNotificationToAnUser(treasurer.getTelegramId(), notificationMessage);
        }

        if (transactionType.getStatus() == 0) {
            var accountant = userRepository.findByRoles_Id("ACCOUNTANT").orElseThrow(() ->
                    new AppException(ErrorCode.USER_NOT_EXISTS)); // người nhận
            // Định dạng nội dung thông báo
            String notificationMessage = String.format(
                    """
                    [THÔNG BÁO GIAO DỊCH RÚT QUỸ]
                        - Người thực hiện: %s
                        - Số tiền giao dịch: %, .2f VNĐ
                        - Quỹ: %s
                        - Thời gian: %s 
                        - Trạng thái: Chờ duyệt
                                        
                        Vui lòng kiểm tra và xử lý!
                    """,
                    user.getFullname(),
                    request.getAmount(),
                    fund.getFundName(),
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"))
            );
            log.info(accountant.getFullname());
            log.info(accountant.getTelegramId().toString());
            telegramService.sendNotificationToAnUser(accountant.getTelegramId(), notificationMessage);
        }

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


    // Lấy danh sách giao dịch đóng góp do thủ quỹ quản lý theo bộ lọc (theo quỹ, theo loại giao dịch, theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái)
    public Map<String, Object> filterContributionByTreasurer(String fundId, String transTypeId,
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

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        List<FundTransaction> fundTransactions = fundTransactionRepository.filterTransactionsByTreasurer(
                fundId, transTypeId, start, end, departmentId, userId, status, id);

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
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 1)
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
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
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 0)
                .mapToDouble(FundTransaction::getAmount)
                .sum();

        // Map danh sách giao dịch sang DTO và thêm tổng số tiền vào response
        List<FundTransactionResponse> responses = fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 0)
                .map(fundTransactionMapper::toFundTransactionResponse)
                .sorted(Comparator.comparing(FundTransactionResponse::getTransDate).reversed())
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("transactions", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Lấy báo cáo đóng góp cá nhân theo bộ lọc
    public Map<String, Object> getIndividualContributionReport(String fundId, String transTypeId, String startDate, String endDate, Integer year, Integer month) {
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

        if (fundId == null || fundId.isEmpty()) {
            fundId = null;
        }
        if (transTypeId == null || transTypeId.isEmpty()) {
            transTypeId = null;
        }

        // Lấy dữ liệu từ repository
        List<TransactionReportResponse> reportData = fundTransactionRepository.getIndividualTransactionReport(userId, fundId, transTypeId, 1, year, month, start, end);

        // Tính tổng số tiền giao dịch
        double totalAmount = reportData.stream()
                .mapToDouble(TransactionReportResponse::getAmount) // Lấy tổng số tiền từ báo cáo
                .sum();

        // Tính tổng số giao dịch
        long totalTransactions = reportData.stream()
                .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                .sum();

        // Sắp xếp
        List<TransactionReportResponse> sortedResponses = reportData.stream()
                .sorted(Comparator.comparing((TransactionReportResponse::getFundName), vietnameseCollator).thenComparing(
                        Comparator.comparing(TransactionReportResponse::getTransType, vietnameseCollator)
                                .thenComparingLong(TransactionReportResponse::getQuantity)
                                .thenComparingDouble(TransactionReportResponse::getAmount)))
                .toList();


        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("reportData", sortedResponses);  // Dữ liệu báo cáo chi tiết đã được sắp xếp
        result.put("totalAmount", totalAmount); // Tổng số tiền giao dịch
        result.put("totalTransactions", totalTransactions); // Tổng số giao dịch

        return result;
    }


    // Lấy báo cáo giao dịch đóng góp theo thủ quỹ
    public Map<String, Object> getTreasurerContributionReport(String fundId, String transTypeId, String startDate, String endDate, Integer year, Integer month) {
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
        List<TransactionReportResponse> reportData = fundTransactionRepository.getContributionTransactionReport(userId, fundId, transTypeId, year, month, start, end);

        // Tính tổng số tiền giao dịch
        double totalAmount = reportData.stream()
                .mapToDouble(TransactionReportResponse::getAmount) // Lấy tổng số tiền từ báo cáo
                .sum();

        // Tính tổng số giao dịch
        long totalTransactions = reportData.stream()
                .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                .sum();

        // Sắp xếp
        List<TransactionReportResponse> sortedResponses = reportData.stream()
                .sorted(Comparator.comparing((TransactionReportResponse::getFundName), vietnameseCollator).thenComparing(
                        Comparator.comparing(TransactionReportResponse::getTransType, vietnameseCollator)
                                .thenComparingLong(TransactionReportResponse::getQuantity)
                                .thenComparingDouble(TransactionReportResponse::getAmount)))
                .toList();


        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("reportData", sortedResponses);  // Dữ liệu báo cáo chi tiết đã được sắp xếp
        result.put("totalAmount", totalAmount); // Tổng số tiền giao dịch
        result.put("totalTransactions", totalTransactions); // Tổng số giao dịch

        return result;
    }


    // Lấy báo cáo rút quỹ của thủ quỹ theo bộ lọc
    public Map<String, Object> getTreasurerWithdrawalReport(String fundId, String transTypeId, String startDate, String endDate, Integer year, Integer month) {
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

        if (fundId == null || fundId.isEmpty()) {
            fundId = null;
        }
        if (transTypeId == null || transTypeId.isEmpty()) {
            transTypeId = null;
        }

        // Lấy dữ liệu từ repository
        List<TransactionReportResponse> reportData = fundTransactionRepository.getIndividualTransactionReport(userId, fundId, transTypeId, 0, year, month, start, end);

        // Tính tổng số tiền giao dịch
        double totalAmount = reportData.stream()
                .mapToDouble(TransactionReportResponse::getAmount) // Lấy tổng số tiền từ báo cáo
                .sum();

        // Tính tổng số giao dịch
        long totalTransactions = reportData.stream()
                .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                .sum();

        // Sắp xếp
        List<TransactionReportResponse> sortedResponses = reportData.stream()
                .sorted(Comparator.comparing((TransactionReportResponse::getFundName), vietnameseCollator).thenComparing(
                        Comparator.comparing(TransactionReportResponse::getTransType, vietnameseCollator)
                                .thenComparingLong(TransactionReportResponse::getQuantity)
                                .thenComparingDouble(TransactionReportResponse::getAmount)))
                .toList();


        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("reportData", sortedResponses);  // Dữ liệu báo cáo chi tiết đã được sắp xếp
        result.put("totalAmount", totalAmount); // Tổng số tiền giao dịch
        result.put("totalTransactions", totalTransactions); // Tổng số giao dịch

        return result;
    }


    // Lấy báo cáo giao dịch theo bộ lọc
    public Map<String, Object> getTransactionReport(String fundId, String transTypeId, Integer status, String startDate, String endDate, Integer year, Integer month) {
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
        List<TransactionReportResponse> reportData = fundTransactionRepository.getTransactionReport(fundId, transTypeId, status, year, month, start, end);

        // Tính tổng số tiền giao dịch
        double totalAmount = reportData.stream()
                .mapToDouble(TransactionReportResponse::getAmount) // Lấy tổng số tiền từ báo cáo
                .sum();

        // Tính tổng số giao dịch
        long totalTransactions = reportData.stream()
                .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                .sum();

        // Sắp xếp
        List<TransactionReportResponse> sortedResponses = reportData.stream()
                .sorted(Comparator.comparing((TransactionReportResponse::getFundName), vietnameseCollator).thenComparing(
                        Comparator.comparing(TransactionReportResponse::getTransType, vietnameseCollator)
                                .thenComparingLong(TransactionReportResponse::getQuantity)
                                .thenComparingDouble(TransactionReportResponse::getAmount)))
                .toList();


        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("reportData", sortedResponses);  // Dữ liệu báo cáo chi tiết đã được sắp xếp
        result.put("totalAmount", totalAmount); // Tổng số tiền giao dịch
        result.put("totalTransactions", totalTransactions); // Tổng số giao dịch

        return result;
    }


    // Lấy báo cáo đóng góp và thanh toán của người dùng trong tháng
    public Map<String, Object> getIndividualMonthlyReport() {
        // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Lấy dữ liệu từ repository
        List<TransactionReportResponse> contribution = fundTransactionRepository.getIndividualTransactionReport(id, null, null, 1, null, null, startOfMonth, endOfMonth);

        // Tính tổng số tiền giao dịch
        double totalIncome = contribution.stream()
                .mapToDouble(TransactionReportResponse::getAmount) // Lấy tổng số tiền từ báo cáo
                .sum();

        // Tính tổng số giao dịch
        long totalContributions = contribution.stream()
                .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                .sum();

        // Lấy dữ liệu từ repository
        List<PaymentReportResponse> payment = paymentReqRepository.getIndividualPaymentReport(id, null, null, null, startOfMonth, endOfMonth);
        double totalPayment = payment.stream().mapToDouble(PaymentReportResponse::getReceivedAmount).sum();
        long totalPaymentRequest = payment.stream().mapToLong(PaymentReportResponse::getReceivedQuantity).sum();

        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("totalIncome", totalIncome); // Tổng số tiền giao dịch
        result.put("totalContributions", totalContributions); // Tổng số giao dịch
        result.put("totalPayment", totalPayment);
        result.put("totalPaymentRequest", totalPaymentRequest);

        return result;
    }


    // Lấy tổng số tiền đóng góp, tổng số giao dịch đóng góp, tổng số tiền đề nghị thanh toán, tổng số giao dịch thanh toán theo tháng
    public Map<String, Object> generateIndividualMonthlyReport() {
        String id = securityExpression.getUserId();
        int year = LocalDate.now().getYear();

        Map<String, Object> report = new HashMap<>();
        report.put("monthlyContributions", fundTransactionRepository.findMonthlyContributionsByUser(id, year));
        report.put("monthlyPayments", paymentReqRepository.findMonthlyPaymentsByUser(id, year));
        return report;
    }

    // Lấy báo cáo quỹ theo các tháng của năm hiện tại ĐỐI VỚI KẾ TOÁN
    public Map<String, Object> getTransactionSummaryByMonth() {
        int year = LocalDate.now().getYear();

        // Đóng góp quỹ
        List<Map<String, Object>> contributions = fundTransactionRepository.findMonthlyContributions(year);

        // Rút quỹ
        List<Map<String, Object>> withdrawals = fundTransactionRepository.findMonthlyWithdrawals(year);

        // Thanh toán
        List<Map<String, Object>> payments = paymentReqRepository.findMonthlyPayments(year);

        // Tổng hợp kết quả
        Map<String, Object> summary = new HashMap<>();
        summary.put("contributions", contributions);
        summary.put("withdrawals", withdrawals);
        summary.put("payments", payments);

        return summary;
    }


    // Lấy báo cáo quỹ theo các tháng của năm hiện tại ĐỐI VỚI THỦ QUỸ
    public Map<String, Object> getTransactionSummaryByMonthAndTreasurer() {
        int year = LocalDate.now().getYear();
        String id = securityExpression.getUserId();

        // Đóng góp quỹ
        List<Map<String, Object>> contributions = fundTransactionRepository.findMonthlyContributionsByTreasurer(id, year);

        // Rút quỹ
        List<Map<String, Object>> withdrawals = fundTransactionRepository.findMonthlyWithdrawalsByTreasurer(id, year);

        // Thanh toán
        List<Map<String, Object>> payments = paymentReqRepository.findMonthlyPaymentsByTreasurer(id, year);

        // Tổng hợp kết quả
        Map<String, Object> summary = new HashMap<>();
        summary.put("contributions", contributions);
        summary.put("withdrawals", withdrawals);
        summary.put("payments", payments);

        return summary;
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

        // Gửi thông báo telegram
        var user = userRepository.findById(fundTransaction.getUser().getId()).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS)); // người nhận
        String approvedUser = ""; // người xử lý
        // Đóng góp
        if (transactionType.getStatus() == 1) {
            approvedUser = fund.getUser().getFullname();
        }
        // Rút quỹ
        if (transactionType.getStatus() == 0) {
            var accountant = userRepository.findByRoles_Id("ACCOUNTANT").orElseThrow(() ->
                    new AppException(ErrorCode.USER_NOT_EXISTS));
            approvedUser = accountant.getFullname();
        }
        // Định dạng nội dung thông báo
        String notificationMessage = String.format(
                """
                [THÔNG BÁO GIAO DỊCH ĐÃ ĐƯỢC DUYỆT]
                
                    - Người xử lý giao dịch: %s
                    - Số tiền giao dịch: %, .2f VNĐ
                    - Quỹ: %s
                    - Thời gian: %s 
                    - Trạng thái: Đã duyệt
                                    
                    Vui lòng kiểm tra!
                """,
                approvedUser,
                fundTransaction.getAmount(),
                fund.getFundName(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"))
        );
        telegramService.sendNotificationToAnUser(user.getTelegramId(), notificationMessage);

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

        // Gửi thông báo telegram
        var user = userRepository.findById(fundTransaction.getUser().getId()).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS)); // Người nhận
        String approvedUser = ""; // Người xử lý
        // Đóng góp quỹ
        if (fundTransaction.getTransactionType().getStatus() == 1) {
            approvedUser = fundTransaction.getFund().getUser().getFullname();
        }
        // Rút quỹ
        if (fundTransaction.getTransactionType().getStatus() == 0) {
            var accountant = userRepository.findByRoles_Id("ACCOUNTANT").orElseThrow(() ->
                    new AppException(ErrorCode.USER_NOT_EXISTS));
            approvedUser = accountant.getFullname();
        }
        // Định dạng nội dung thông báo
        String notificationMessage = String.format(
                """
                [THÔNG BÁO GIAO DỊCH ĐÃ BỊ TỪ CHỐI]
                
                    - Người xử lý giao dịch: %s
                    - Số tiền giao dịch: %, .2f VNĐ
                    - Quỹ: %s
                    - Thời gian: %s 
                    - Trạng thái: Từ chối
                                    
                    Vui lòng kiểm tra!
                """,
                approvedUser,
                fundTransaction.getAmount(),
                fundTransaction.getFund().getFundName(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"))
        );
        telegramService.sendNotificationToAnUser(user.getTelegramId(), notificationMessage);

        return fundTransactionMapper.toFundTransactionResponse(fundTransaction);
    }


    // Xoá giao dịch
    @Transactional
    public void delete(String id) {
        var fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));

        var fund = fundTransaction.getFund();
        var transactionType = fundTransaction.getTransactionType();

        // Nếu là giao dịch đóng góp quỹ
        if (transactionType.getStatus() == 1) {
            fund.setBalance(fund.getBalance() - fundTransaction.getAmount());
        }

        // nếu là giao dịch rút quỹ
        if (transactionType.getStatus() == 0) {
            fund.setBalance(fund.getBalance() + fundTransaction.getAmount());
        }

        fundTransaction.setUser(null);
        fundTransaction.setFund(null);
        fundTransaction.setTransactionType(null);

        fundTransactionRepository.deleteById(id);
    }
}
