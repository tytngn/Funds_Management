package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FundService {

    FundRepository fundRepository;
    FundMapper fundMapper;
    UserRepository userRepository;
    SecurityExpression securityExpression;

    // Tạo quỹ
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

    // Lấy danh sách tất cả các quỹ
    public List<FundResponse> getAll() {
        var funds = fundRepository.findAll();
        return funds.stream().map(fund -> fundMapper.toFundResponse(fund)).toList();
    }

    // Lấy thông tin quỹ theo Id
    public FundResponse getById(String id) {
        return fundMapper.toFundResponse(fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS)));
    }

    // lấy danh sách các quỹ đang hoạt động
    public List<FundResponse> getActiveFunds () {
        var funds = fundRepository.findByStatus(1);
        return funds.stream()
                .map(fund -> fundMapper.toFundResponse(fund))
                .sorted(Comparator.comparing(FundResponse::getCreateDate).reversed())
                .toList();
    }

    // Lấy danh sách quỹ theo bộ lọc: theo thời gian, theo trạng thái, theo phòng ban, theo thủ quỹ
    public Map<String, Object> filterFunds(LocalDate start, LocalDate end, Integer status,
                                           String departmentId, String userId) {
        // Lấy danh sách quỹ theo bộ lọc
        var funds = fundRepository.filterFunds(start, end, status, departmentId, userId);

        // Tính tổng số tiền của các quỹ
        double totalAmount = funds.stream()
                .mapToDouble(Fund::getBalance)
                .sum();

        // Chuyển đổi danh sách quỹ sang DTO và sắp xếp theo ngày tạo mới nhất
        List<FundResponse> responses = funds.stream()
                .map(fundMapper::toFundResponse)
                .sorted(Comparator.comparing(FundResponse::getCreateDate).reversed())
                .toList();

        // Đưa kết quả vào Map và trả về
        Map<String, Object> result = new HashMap<>();
        result.put("funds", responses);
        result.put("totalAmount", totalAmount);

        return result;
    }


    // Cập nhật quỹ
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

    // Xoá quỹ
    public void delete(String id) {

        // kiểm tra quỹ có tồn tại không
        var fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUNCTIONS_NOT_EXISTS));

        fund.setUser(null);

        fundRepository.delete(fund);
    }
}
