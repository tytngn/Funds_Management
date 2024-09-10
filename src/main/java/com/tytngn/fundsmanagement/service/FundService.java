package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.entity.Fund;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FundMapper;
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FundService {

    FundRepository fundRepository;
    FundMapper fundMapper;
    UserRepository userRepository;

    public FundResponse create(FundRequest request) {

        var fund = fundMapper.toFund(request);

        fund.setBalance(0.0);
        fund.setStatus(1);
        fund.setCreateDate(LocalDate.now());

        var user = userRepository.findById(request.getUser())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        fund.setUser(user);

        return fundMapper.toFundResponse(fundRepository.save(fund));
    }

    public List<FundResponse> getAll() {
        var funds = fundRepository.findAll();
        return funds.stream().map(fund -> fundMapper.toFundResponse(fund)).toList();
    }

    public FundResponse update(String id, FundRequest request) {
        Fund fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        var user = userRepository.findById(request.getUser())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        fundMapper.updateFund(fund, request);
        fund.setUser(user);

        return fundMapper.toFundResponse(fundRepository.save(fund));

    }

    public void delete(String id) {
        var fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));

        fund.setUser(null);

        fundRepository.delete(fund);
    }
}
