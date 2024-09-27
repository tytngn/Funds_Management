package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.dto.request.UserFundRequest;
import com.tytngn.fundsmanagement.dto.response.FundMemberResponse;
import com.tytngn.fundsmanagement.dto.response.UserFundResponse;
import com.tytngn.fundsmanagement.entity.UserFund;
import com.tytngn.fundsmanagement.entity.UserFundId;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.UserFundMapper;
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.UserFundRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserFundService {

    UserFundRepository userFundRepository;
    FundRepository fundRepository;
    UserRepository userRepository;
    UserFundMapper userFundMapper;

    // Tạo quan hệ giữa user và fund
    public UserFundResponse assignUserToFund(UserFundRequest request) {

        String userId = request.getUserId();
        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(userId).orElseThrow(() ->
                new AppException(ErrorCode.USER_NOT_EXISTS));
        log.info(userId);
        String fundId = request.getFundId();
        // Tìm kiếm quỹ trong cơ sở dữ liệu
        var fund = fundRepository.findById(fundId).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));
        log.info(fundId);

        // Tạo ID cho UserFund
        UserFundId userFundId = new UserFundId(user.getId(), fund.getId());

        var userFund = userFundMapper.toUserFund(request);
        userFund.setId(userFundId);
        userFund.setUser(user);
        userFund.setFund(fund);

        userFundRepository.save(userFund);

        return userFundMapper.toUserFundResponse(userFund);
    }

    // Lấy tất cả quỹ mà user được phép giao dịch
    public List<UserFundResponse> getFundsByUserId(String userId) {
        List<UserFund> userFunds = userFundRepository.findByUserId(userId);

        return userFunds.stream()
                .map(userFundMapper::toUserFundResponse)
                .collect(Collectors.toList());
    }

    // Lấy tất cả người dùng có thể giao dịch với một quỹ cụ thể
    public List<UserFundResponse> getUsersByFundId(String fundId) {
        List<UserFund> userFunds = userFundRepository.findByFundId(fundId);

        return userFunds.stream()
                .map(userFundMapper::toUserFundResponse)
                .collect(Collectors.toList());
    }

    // Lấy danh sách chi tiết người dùng được giao dịch với quỹ
    public List<FundMemberResponse> getMembersByFundId(String fundId) {
        List<Object[]> results = userFundRepository.findFundMemberByFundId(fundId);
        return results.stream().map(result -> {
            return new FundMemberResponse(
                    (String) result[0],  // id
                    (String) result[1],  // username
                    (String) result[2],   // email
                    (String) result[3], // fullname
                    (int) result[4] // status
            );
        }).collect(Collectors.toList());
    }

    // Cập nhật quan hệ giữa user và fund
    public UserFundResponse updateUserFundStatus(UserFundId id, int newStatus) {

        UserFund userFund = userFundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.USERFUNDS_NOT_EXISTS));

        userFund.setStatus(newStatus);

        userFundRepository.save(userFund);

        return userFundMapper.toUserFundResponse(userFund);
    }

}
