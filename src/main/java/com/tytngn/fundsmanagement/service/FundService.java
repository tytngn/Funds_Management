package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.entity.Fund;
import com.tytngn.fundsmanagement.entity.FundPermission;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FundMapper;
import com.tytngn.fundsmanagement.repository.FundPermissionRepository;
import com.tytngn.fundsmanagement.repository.FundRepository;
import com.tytngn.fundsmanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FundService {

    FundRepository fundRepository;
    FundMapper fundMapper;
    UserRepository userRepository;
    FundPermissionRepository fundPermissionRepository;
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
        fundRepository.save(fund);

        // Tạo quyền truy cập cho người tạo quỹ
        FundPermission fundPermission = new FundPermission();
        fundPermission.setUser(user);
        fundPermission.setFund(fund);
        fundPermission.setCanWithdraw(true); // cấp quyền rút quỹ
        fundPermission.setGrantedDate(LocalDate.now());
        fundPermissionRepository.save(fundPermission);

        return fundMapper.toFundResponse(fund);
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


    // lấy danh sách quỹ theo thủ quỹ
    public List<FundResponse> getFundsByTreasurer() {
        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        var funds = fundRepository.findByUserIdAndStatus(id, 1);

        return funds.stream()
                .map(fundMapper::toFundResponse)
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


    // Lấy danh sách quỹ do người dùng làm thủ quỹ theo bộ lọc
    public Map<String, Object> filterFundsByTreasurer(LocalDate start, LocalDate end, Integer status) {
        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Lấy danh sách quỹ theo bộ lọc
        var funds = fundRepository.filterFunds(start, end, status, null, id);

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


    // Báo cáo tổng quan quỹ: tổng số tiền của tất cả quỹ, số lượng quỹ hoạt động và số lượng quỹ ngưng hoạt động
    public Map<String, Object> getFundOverview(Integer year, Integer month, LocalDate start, LocalDate end) {
        var funds = fundRepository.findFundsByDateFilter(year, month, start, end);

        double totalBalance = funds.stream().mapToDouble(Fund::getBalance).sum();
        long activeFundsCount = funds.stream().filter(fund -> fund.getStatus() == 1).count();
        long inactiveFundsCount = funds.stream().filter(fund -> fund.getStatus() == 0).count();

        Map<String, Object> report = new HashMap<>();
        report.put("totalBalance", totalBalance);
        report.put("activeFundsCount", activeFundsCount);
        report.put("inactiveFundsCount", inactiveFundsCount);

        return report;
    }


    // Báo cáo chi tiết quỹ
//    public List<FundReportResponse> generateFundReport(Integer year, Integer month, LocalDate startDate, LocalDate endDate) {
//        return fundRepository.getFundReport(year, month, startDate, endDate);
//    }


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


    // Chuyển thủ quỹ
    public FundResponse assignTreasurer(String id, String userId) {

        // kiểm tra quỹ có tồn tại không
        Fund fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        var oldUser = fund.getUser();
        FundPermission existingPermission = fundPermissionRepository.findByUserIdAndFundId(oldUser.getId(), id);
        existingPermission.setCanWithdraw(false);
        existingPermission.setGrantedDate(LocalDate.now());
        fundPermissionRepository.save(existingPermission);

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var newUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        fund.setUpdateDate(LocalDate.now());
        fund.setUser(newUser);
        fundRepository.save(fund);

        // Tạo quyền truy cập cho người tạo quỹ
        FundPermission fundPermission = new FundPermission();
        fundPermission.setUser(newUser);
        fundPermission.setFund(fund);
        fundPermission.setCanWithdraw(true); // cấp quyền rút quỹ
        fundPermission.setGrantedDate(LocalDate.now());
        fundPermissionRepository.save(fundPermission);

        return fundMapper.toFundResponse(fund);
    }


    // Vô hiệu hoá quỹ
    public FundResponse disable(String id) {

        // kiểm tra quỹ có tồn tại không
        Fund fund = fundRepository.findById(id).orElseThrow(() ->
                new AppException(ErrorCode.FUND_NOT_EXISTS));

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        fund.setUpdateDate(LocalDate.now());
        fund.setUser(user);
        fund.setStatus(0);

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
