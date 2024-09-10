package com.tytngn.fundsmanagement.service;

import com.tytngn.fundsmanagement.dto.request.BankAccountRequest;
import com.tytngn.fundsmanagement.dto.response.BankAccountResponse;
import com.tytngn.fundsmanagement.entity.BankAccount;
import com.tytngn.fundsmanagement.entity.User;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.BankAccountMapper;
import com.tytngn.fundsmanagement.repository.BankAccountRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BankAccountService {

    BankAccountRepository bankAccountRepository;
    BankAccountMapper bankAccountMapper;
    UserRepository userRepository;

    public BankAccountResponse createBankAccount(BankAccountRequest request) {

        if(bankAccountRepository.existsByAccountNumberAndBankName(
                request.getAccountNumber(),
                request.getBankName()))
            throw new AppException(ErrorCode.BANK_ACCOUNT_EXISTS);

        var user = userRepository.findById(request.getUser()).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        if(!Objects.isNull(user.getAccount()))
            throw new AppException(ErrorCode.USER_HAS_BANK_ACCOUNT);

        BankAccount bankAccount = bankAccountMapper.toBankAccount(request);
        bankAccount.setUser(user);
        bankAccount.setCreatedDate(LocalDate.now());

        bankAccountRepository.save(bankAccount);
        return bankAccountMapper.toBankAccountResponse(bankAccount);
    }

    public List<BankAccountResponse> getAllBankAccount() {
        var bankAccounts = bankAccountRepository.findAll()
                .stream()
                .map(b -> bankAccountMapper.toBankAccountResponse(b))
                .toList();

        return bankAccounts;
    }

    public BankAccountResponse updateBankAccount(String id, BankAccountRequest request) {
        BankAccount bankAccount = bankAccountRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BANK_ACCOUNT_NOT_EXISTS));

        var user = userRepository.findById(request.getUser()).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));

        bankAccountMapper.updateBankAccount(bankAccount, request);
        bankAccount.setUser(user);

        return bankAccountMapper.toBankAccountResponse(bankAccountRepository.save(bankAccount));
    }

    public void deleteBankAccount(String id) {
        var bankAccount = bankAccountRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.BANK_ACCOUNT_NOT_EXISTS));

        bankAccountRepository.deleteById(id);
    }
}
