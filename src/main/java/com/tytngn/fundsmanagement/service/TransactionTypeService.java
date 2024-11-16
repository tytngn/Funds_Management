package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.TransactionTypeRequest;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
import com.tytngn.fundsmanagement.entity.TransactionType;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.TransactionTypeMapper;
import com.tytngn.fundsmanagement.repository.TransactionTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TransactionTypeService {

    TransactionTypeRepository transactionTypeRepository;
    TransactionTypeMapper transactionTypeMapper;
    Collator vietnameseCollator;

    public TransactionTypeResponse create(TransactionTypeRequest request) {

        TransactionType transactionType = transactionTypeMapper.toTransactionType(request);

        if (transactionTypeRepository.existsByName(request.getName())){
            throw new AppException(ErrorCode.TRANSACTION_TYPE_EXISTS);
        }
        transactionType = transactionTypeRepository.save(transactionType);

        return transactionTypeMapper.toTransactionTypeResponse(transactionType);
    }

    public List<TransactionTypeResponse> getAll() {

        var transactionType = transactionTypeRepository.findAll()
                .stream()
                .map(type -> transactionTypeMapper.toTransactionTypeResponse(type))
                .sorted(Comparator.comparing(TransactionTypeResponse::getName, vietnameseCollator))
                .toList();

        return transactionType;
    }

    public TransactionTypeResponse getById(String id) {
        return transactionTypeMapper.toTransactionTypeResponse(transactionTypeRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS)));
    }

    // Lấy danh sách loại giao dịch đóng góp quỹ
    public  List<TransactionTypeResponse> getByStatusContribute() {
        var transactionType = transactionTypeRepository.findAllByStatus(1)
                .stream()
                .map(type -> transactionTypeMapper.toTransactionTypeResponse(type))
                .sorted(Comparator.comparing(TransactionTypeResponse::getName, vietnameseCollator))
                .toList();
        return transactionType;
    }

    // Lấy danh sách loại giao dịch rút quỹ
    public  List<TransactionTypeResponse> getByStatusWithdraw() {
        var transactionType = transactionTypeRepository.findAllByStatus(0)
                .stream()
                .map(type -> transactionTypeMapper.toTransactionTypeResponse(type))
                .sorted(Comparator.comparing(TransactionTypeResponse::getName, vietnameseCollator))
                .toList();
        return transactionType;
    }

    public TransactionTypeResponse update(String id, TransactionTypeRequest request) {
        TransactionType transactionType = transactionTypeRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));

        transactionTypeMapper.updateTransactionType(transactionType, request);
        return transactionTypeMapper.toTransactionTypeResponse(transactionTypeRepository.save(transactionType));
    }

    public void delete(String id) {
        var transType = transactionTypeRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EXISTS));

        var fundTransactions = transType.getFundTransactions();
        if (!fundTransactions.isEmpty()) {
            throw new AppException(ErrorCode.TRANSACTION_TYPE_NOT_EMPTY);
        }
        transactionTypeRepository.deleteById(id);
    }
}
