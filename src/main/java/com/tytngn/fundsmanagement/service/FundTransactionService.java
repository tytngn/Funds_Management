package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundContributionRequest;
import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.FundContributionResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

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
    SecurityExpression securityExpression;

    // Tạo giao dịch
    @Transactional
    public FundTransactionResponse create(FundTransactionRequest request) {

        // Tạo 1 giao dịch
        FundTransaction fundTransaction = fundTransactionMapper.toFundTransaction(request);
        fundTransaction.setStatus(1); // Chờ duyệt
        fundTransaction.setTransDate(LocalDateTime.now()); // Thời gian giao dịch

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


    // Lấy danh sách giao dịch theo bộ lọc (theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái)
    public List<FundTransactionResponse> getContributionByFilter(String fundId, String transTypeId,
                                                                 String startDate, String endDate,
                                                                 String departmentId, String userId,
                                                                 Integer status) {

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

        List<FundTransaction> fundTransactions = fundTransactionRepository.
                filterTransactions(fundId, transTypeId, start, end, departmentId, userId, status);

        return fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 1) // Lấy loại giao dịch đóng góp quỹ
                .map(fundTrans -> fundTransactionMapper.toFundTransactionResponse(fundTrans))
                .toList();
    }


    // Lấy danh sách giao dịch theo bộ lọc (theo thời gian, theo phòng ban, theo cá nhân)
    public List<FundTransactionResponse> getWithdrawByFilter(String fundId, String transTypeId,
                                                                 String startDate, String endDate,
                                                                 String departmentId, String userId,
                                                                 Integer status) {

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

        List<FundTransaction> fundTransactions = fundTransactionRepository.
                filterTransactions(fundId, transTypeId, start, end, departmentId, userId, status);

        return fundTransactions.stream()
                .filter(fundTrans -> fundTrans.getTransactionType().getStatus() == 0) // Lấy loại giao dịch đóng góp quỹ
                .map(fundTrans -> fundTransactionMapper.toFundTransactionResponse(fundTrans))
                .toList();
    }



    // Lấy tổng số tiền giao dịch của người dùng trong một quỹ
    public List<FundContributionResponse> getFundTransactionSummary(FundContributionRequest request) {
        List<Object[]> results = fundTransactionRepository.getFundTransactionSummary(request.getFundId());
        List<FundContributionResponse> responseList = new ArrayList<>();

        for (Object[] result : results) {
            String fullname = (String) result[0];
            Double totalAmount = (Double) result[1];
            String transactionType = (String) result[2];
            responseList.add(fundTransactionMapper.toFundContributionResponse(fullname, transactionType, totalAmount));
        }

        return responseList;
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
