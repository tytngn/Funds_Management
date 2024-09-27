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
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.FundTransactionRepository;
import com.tytngn.fundsmanagement.repository.TransactionTypeRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    SecurityExpression securityExpression;

    @Transactional
    public FundTransactionResponse create(FundTransactionRequest request) {

        FundTransaction fundTransaction = fundTransactionMapper.toFundTransaction(request);
        fundTransaction.setStatus(1); // Chờ duyệt
        fundTransaction.setTransDate(LocalDateTime.now());

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
        if(fund.getStatus() == 0)
            throw new AppException(ErrorCode.INACTIVE_FUND);
        fundTransaction.setFund(fund);

        // loại giao dịch
        var transactionType = transactionTypeRepository.findById(request.getTransactionType()).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));
        fundTransaction.setTransactionType(transactionType);

        fundTransaction = fundTransactionRepository.save(fundTransaction);

        return fundTransactionMapper.toFundTransactionResponse(fundTransaction);
    }

    public List<FundTransactionResponse> getAll() {

        var fundTransaction = fundTransactionRepository.findAll()
                .stream()
                .map(fundTrans -> fundTransactionMapper.toFundTransactionResponse(fundTrans))
                .toList();

        return fundTransaction;
    }

    public FundTransactionResponse getById(String id) {
        return fundTransactionMapper.toFundTransactionResponse(fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS)));
    }

    // Tính tổng số tiền đóng góp của user vào fund
//    public FundContributionResponse getTotalContribution(FundContributionRequest request) {
//        double total = fundTransactionRepository.findTotalContributionByUserAndFund(request.getUserId(), request.getFundId());
//
//        return fundTransactionMapper.toFundContributionResponse(request.getUserId(), request.getFundId(), total);
//    }

//    public FundContributionResponse getTotalAmountByUserAndFund(FundContributionRequest request) {
//        Double total = fundTransactionRepository.getTotalAmountByUserAndFund(request.getUserId(), request.getFundId());
//        if(total == null) {
//            total = 0.0;
//        }
//        return fundTransactionMapper.toFundContributionResponse(request.getUserId(), request.getFundId(), total);
//    }

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

    @Transactional
    public FundTransactionResponse update(String id, FundTransactionRequest request) {
        FundTransaction fundTransaction = fundTransactionRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_TRANSACTION_NOT_EXISTS));

        fundTransactionMapper.updateFundTransaction(fundTransaction, request);

        fundTransaction.setTransDate(LocalDateTime.now());

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
