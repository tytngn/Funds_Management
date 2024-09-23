package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
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

        // nếu là giao dịch đóng góp quỹ
        if(transactionType.getStatus() == 1){
            fund.setBalance(fund.getBalance() + request.getAmount());
        }
        // nếu là giao dịch rút quỹ
        if(transactionType.getStatus() == 0) {
            // nếu số dư không đủ
            if(fund.getBalance() < request.getAmount()){
                throw new AppException(ErrorCode.INSUFFICIENT_FUNDS_TRANSACTION);
            }
            fund.setBalance(fund.getBalance() - request.getAmount());
        }

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
