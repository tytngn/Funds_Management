package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.configuration.SecurityExpression;
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
    SecurityExpression securityExpression;

    public FundResponse create(FundRequest request) {

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // tạo quỹ mới
        var fund = fundMapper.toFund(request);
        fund.setBalance(0.0);
        fund.setStatus(1);
        fund.setCreateDate(LocalDate.now());
        fund.setUser(user);

        return fundMapper.toFundResponse(fundRepository.save(fund));
    }

    public List<FundResponse> getAll() {
        var funds = fundRepository.findAll();
        return funds.stream().map(fund -> fundMapper.toFundResponse(fund)).toList();
    }

    public FundResponse getById(String id) {
        return fundMapper.toFundResponse(fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS)));
    }

    public FundResponse update(String id, FundRequest request) {

        // kiểm tra quỹ có tồn tại không
        Fund fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // cập nhật quỹ
        fundMapper.updateFund(fund, request);
        fund.setUpdateDate(LocalDate.now());
        fund.setUser(user);

        return fundMapper.toFundResponse(fundRepository.save(fund));
    }

    public void delete(String id) {

        // kiểm tra quỹ có tồn tại không
        var fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));

        fund.setUser(null);

        fundRepository.delete(fund);
    }
}
