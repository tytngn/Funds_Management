package com.tytngn.fundsmanagement.service;


import com.tytngn.fundsmanagement.configuration.SecurityExpression;
import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.*;
import com.tytngn.fundsmanagement.entity.Fund;
import com.tytngn.fundsmanagement.entity.FundPermission;
import com.tytngn.fundsmanagement.exception.AppException;
import com.tytngn.fundsmanagement.exception.ErrorCode;
import com.tytngn.fundsmanagement.mapper.FundMapper;
import com.tytngn.fundsmanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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
    FundTransactionRepository fundTransactionRepository;
    PaymentReqRepository paymentReqRepository;

    SecurityExpression securityExpression;
    Collator vietnameseCollator;

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
    public Map<String, Object> generateFundReport(String fundId, LocalDate startDate, LocalDate endDate, Integer year, Integer month) {
        // Xác định khoảng thời gian
        LocalDateTime start = startDate != null ? startDate.atTime(00,00,00) : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;

        // Lấy danh sách quỹ
        List<Fund> funds;
        if (fundId != null && !fundId.trim().isEmpty()) {
            // Nếu có fundId, chỉ lấy quỹ tương ứng
            Optional<Fund> fundOptional = fundRepository.findById(fundId);
            Fund fund = fundOptional.orElseThrow(() -> new AppException(ErrorCode.FUND_NOT_EXISTS));
            funds = fund != null ? List.of(fund) : Collections.emptyList();
        } else {
            // Nếu không có fundId, lấy danh sách quỹ dựa trên các điều kiện về giao dịch, đề nghị thanh toán hoặc phân quyền
            funds = fundRepository.findFundsByFilters(start, end, year, month);
        }

        List<FundReportResponse> report = new ArrayList<>();

        double totalIncome = 0.0; // tổng thu
        double totalExpenditure = 0.0; // tổng chi
        double totalBeginningBalance = 0.0; // tổng số dư đầu kỳ
        double totalRemainingBalance = 0.0; // tổng tồn

        for (Fund fund : funds) {
            FundReportResponse dto = new FundReportResponse();
            dto.setFundName(fund.getFundName());
            dto.setStatus(fund.getStatus());

            // Số dư đầu kỳ (trước thời gian được chọn) = thu - chi - thanh toán
            double beginningBalance = 0.0;
            double incomeBefore = 0.0;
            double expenditureBefore = 0.0;
            incomeBefore = fundTransactionRepository.sumContributionsBefore(fund.getId(), start, year, month);
            expenditureBefore = fundTransactionRepository.sumWithdrawalsBefore(fund.getId(), start, year, month)
                    + paymentReqRepository.sumPaymentsBefore(fund.getId(), start, year, month);

            beginningBalance = incomeBefore - expenditureBefore;
            dto.setBeginningBalance(beginningBalance);
            totalBeginningBalance += beginningBalance;


            // Tổng thu (đóng góp quỹ đã duyệt)
            double fundIncome = fundTransactionRepository.sumContributions(fund.getId(), start, end, year, month);
            dto.setIncome(fundIncome);
            totalIncome += fundIncome;

            // Tổng chi (rút quỹ đã duyệt và thanh toán có status = 4 hoặc status = 5)
            double fundExpenditure = fundTransactionRepository.sumWithdrawals(fund.getId(), start, end, year, month)
                    + paymentReqRepository.sumPayments(fund.getId(), start, end, year, month);
            dto.setExpense(fundExpenditure);
            totalExpenditure += fundExpenditure;

            // Tồn = (Số dư đầu kỳ + Thu) - Chi
            double remainingBalance = (beginningBalance + fundIncome) - fundExpenditure;
            dto.setRemainingBalance(remainingBalance);
            totalRemainingBalance += remainingBalance;

            // Số nhân viên có quyền đóng góp
            int contributorsCount = fundPermissionRepository.countContributors(fund.getId(), startDate, endDate, year, month);
            dto.setContributorsCount(contributorsCount);

            report.add(dto);
        }

        // Sắp xếp theo tên
        List<FundReportResponse> sortedResponses = report.stream()
                .sorted(Comparator.comparing(FundReportResponse::getFundName, vietnameseCollator))
                .toList();

        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("report", sortedResponses);
        result.put("totalIncome", totalIncome);
        result.put("totalExpenditure", totalExpenditure);
        result.put("totalBeginningBalance", totalBeginningBalance);
        result.put("totalRemainingBalance", totalRemainingBalance);

        return result;
    }


    // Báo cáo chi tiết quỹ theo thủ quỹ
    public Map<String, Object> getTreasurerFundReport(String fundId, LocalDate startDate, LocalDate endDate, Integer year, Integer month) {
        // Xác định khoảng thời gian
        LocalDateTime start = startDate != null ? startDate.atTime(00,00,00) : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;

        // Lấy thông tin người dùng đang đăng nhập
        String userId = securityExpression.getUserId();

        // Lấy danh sách quỹ
        List<Fund> funds;
        if (fundId != null && !fundId.trim().isEmpty()) {
            // Nếu có fundId, chỉ lấy quỹ tương ứng
            Optional<Fund> fundOptional = fundRepository.findById(fundId);
            Fund fund = fundOptional.orElseThrow(() -> new AppException(ErrorCode.FUND_NOT_EXISTS));
            funds = fund != null ? List.of(fund) : Collections.emptyList();
        } else {
            // Nếu không có fundId, lấy danh sách quỹ dựa trên các điều kiện về giao dịch, đề nghị thanh toán hoặc phân quyền
            funds = fundRepository.findFundsByTreasurer(userId, start, end, year, month);
        }

        List<FundReportResponse> report = new ArrayList<>();

        double totalIncome = 0.0; // tổng thu
        double totalExpenditure = 0.0; // tổng chi
        double totalBeginningBalance = 0.0; // tổng số dư đầu kỳ
        double totalRemainingBalance = 0.0; // tổng tồn

        for (Fund fund : funds) {
            FundReportResponse dto = new FundReportResponse();
            dto.setFundName(fund.getFundName());
            dto.setStatus(fund.getStatus());

            // Số dư đầu kỳ (trước thời gian được chọn) = thu - chi - thanh toán
            double beginningBalance = 0.0;
            double incomeBefore = 0.0;
            double expenditureBefore = 0.0;
            incomeBefore = fundTransactionRepository.sumContributionsBefore(fund.getId(), start, year, month);
            expenditureBefore = fundTransactionRepository.sumWithdrawalsBefore(fund.getId(), start, year, month)
                    + paymentReqRepository.sumPaymentsBefore(fund.getId(), start, year, month);

            beginningBalance = incomeBefore - expenditureBefore;
            dto.setBeginningBalance(beginningBalance);
            totalBeginningBalance += beginningBalance;


            // Tổng thu (đóng góp quỹ đã duyệt)
            double fundIncome = fundTransactionRepository.sumContributions(fund.getId(), start, end, year, month);
            dto.setIncome(fundIncome);
            totalIncome += fundIncome;

            // Tổng chi (rút quỹ đã duyệt và thanh toán có status = 4 hoặc status = 5)
            double fundExpenditure = fundTransactionRepository.sumWithdrawals(fund.getId(), start, end, year, month)
                    + paymentReqRepository.sumPayments(fund.getId(), start, end, year, month);
            dto.setExpense(fundExpenditure);
            totalExpenditure += fundExpenditure;

            // Tồn = (Số dư đầu kỳ + Thu) - Chi
            double remainingBalance = (beginningBalance + fundIncome) - fundExpenditure;
            dto.setRemainingBalance(remainingBalance);
            totalRemainingBalance += remainingBalance;

            // Số nhân viên có quyền đóng góp
            int contributorsCount = fundPermissionRepository.countContributors(fund.getId(), startDate, endDate, year, month);
            dto.setContributorsCount(contributorsCount);

            report.add(dto);
        }

        // Sắp xếp theo tên
        List<FundReportResponse> sortedResponses = report.stream()
                .sorted(Comparator.comparing(FundReportResponse::getFundName, vietnameseCollator))
                .toList();

        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("report", sortedResponses);
        result.put("totalIncome", totalIncome);
        result.put("totalExpenditure", totalExpenditure);
        result.put("totalBeginningBalance", totalBeginningBalance);
        result.put("totalRemainingBalance", totalRemainingBalance);

        return result;
    }


    // Báo cáo quỹ trong tháng hiện tại
    public Map<String, Object> getCurrentMonthSummary() {
        // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Lấy danh sách quỹ
        List<Fund> funds = fundRepository.findByStatus(1);

        double totalIncome = 0.0; // tổng thu
        double totalExpenditure = 0.0; // tổng chi
        double totalPayment = 0.0; // tổng thanh toán
        double totalRemainingBalance = 0.0; // tổng tồn
        long totalContributions = 0;
        long totalWithdrawals = 0;
        long totalPaymentRequest = 0;

        for (Fund fund : funds) {
            // Tổng thu (đóng góp quỹ đã duyệt)
            double fundIncome = fundTransactionRepository.sumContributions(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalIncome += fundIncome;
            // Lấy dữ liệu từ repository
            List<TransactionReportResponse> contribution = fundTransactionRepository.getTransactionReport(fund.getId(), null, 1, null, null, startOfMonth, endOfMonth);
            // Tính tổng số giao dịch đóng góp
            long transContribution = contribution.stream()
                    .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                    .sum();
            totalContributions += transContribution;

            // Tổng chi (rút quỹ đã duyệt và thanh toán có status = 4 hoặc status = 5)
            double fundExpenditure = fundTransactionRepository.sumWithdrawals(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalExpenditure += fundExpenditure;
            // Lấy dữ liệu từ repository
            List<TransactionReportResponse> withdrawal = fundTransactionRepository.getTransactionReport(fund.getId(), null, 0, null, null, startOfMonth, endOfMonth);
            // Tính tổng số giao dịch đóng góp
            long transWithdrawal = withdrawal.stream()
                    .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                    .sum();
            totalWithdrawals += transWithdrawal;

            double fundPayment = paymentReqRepository.sumPayments(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalPayment += fundPayment;
            long paymentRequest = paymentReqRepository.countPayments(fund.getId(), startOfMonth, endOfMonth);
            totalPaymentRequest += paymentRequest;

            // Tồn = Thu - Chi - thanh toán
            double remainingBalance = fundIncome - (fundExpenditure + fundPayment);
            totalRemainingBalance += remainingBalance;
        }

        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("totalExpenditure", totalExpenditure);
        result.put("totalPayment", totalPayment);
        result.put("totalRemainingBalance", totalRemainingBalance);
        result.put("totalContributions", totalContributions);
        result.put("totalWithdrawals", totalWithdrawals);
        result.put("totalPaymentRequest", totalPaymentRequest);

        return result;
    }


    // Báo cáo quỹ trong tháng hiện tại của thủ quỹ
    public Map<String, Object> getTreasurerMonthlyReports() {
        // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Lấy thông tin người dùng đang đăng nhập
        String id = securityExpression.getUserId();

        // Lấy danh sách quỹ
        List<Fund> funds = fundRepository.findByUserIdAndStatus(id, 1);

        double totalIncome = 0.0; // tổng thu
        double totalExpenditure = 0.0; // tổng chi
        double totalPayment = 0.0; // tổng thanh toán
        double totalRemainingBalance = 0.0; // tổng tồn
        long totalContributions = 0;
        long totalWithdrawals = 0;
        long totalPaymentRequest = 0;

        for (Fund fund : funds) {
            // Tổng thu (đóng góp quỹ đã duyệt)
            double fundIncome = fundTransactionRepository.sumContributions(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalIncome += fundIncome;
            // Lấy dữ liệu từ repository
            List<TransactionReportResponse> contribution = fundTransactionRepository.getTransactionReport(fund.getId(), null, 1, null, null, startOfMonth, endOfMonth);
            // Tính tổng số giao dịch đóng góp
            long transContribution = contribution.stream()
                    .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                    .sum();
            totalContributions += transContribution;

            // Tổng chi (rút quỹ đã duyệt và thanh toán có status = 4 hoặc status = 5)
            double fundExpenditure = fundTransactionRepository.sumWithdrawals(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalExpenditure += fundExpenditure;
            // Lấy dữ liệu từ repository
            List<TransactionReportResponse> withdrawal = fundTransactionRepository.getTransactionReport(fund.getId(), null, 0, null, null, startOfMonth, endOfMonth);
            // Tính tổng số giao dịch đóng góp
            long transWithdrawal = withdrawal.stream()
                    .mapToLong(TransactionReportResponse::getQuantity) // Lấy tổng số lượng giao dịch
                    .sum();
            totalWithdrawals += transWithdrawal;

            double fundPayment = paymentReqRepository.sumPayments(fund.getId(), startOfMonth, endOfMonth, null, null);
            totalPayment += fundPayment;
            long paymentRequest = paymentReqRepository.countPayments(fund.getId(), startOfMonth, endOfMonth);
            totalPaymentRequest += paymentRequest;

            // Tồn = Thu - Chi - thanh toán
            double remainingBalance = fundIncome - (fundExpenditure + fundPayment);
            totalRemainingBalance += remainingBalance;
        }

        // Tạo Map để trả về kết quả
        Map<String, Object> result = new HashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("totalExpenditure", totalExpenditure);
        result.put("totalPayment", totalPayment);
        result.put("totalRemainingBalance", totalRemainingBalance);
        result.put("totalContributions", totalContributions);
        result.put("totalWithdrawals", totalWithdrawals);
        result.put("totalPaymentRequest", totalPaymentRequest);

        return result;
    }


    // Báo cáo chi tiết tất cả quỹ trong tháng hiện tại
    public List<FundDetailsReportResponse> getFundDetailsMonthlyReports() {
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        // Lấy danh sách quỹ
        List<Fund> funds = fundRepository.findByStatus(1);

        List<FundDetailsReportResponse> report = new ArrayList<>();

        for (Fund fund : funds) {
            FundDetailsReportResponse dto = new FundDetailsReportResponse();
            dto.setFundName(fund.getFundName());
            dto.setDescription(fund.getDescription());

            double fundIncome = fundTransactionRepository.sumContributions(fund.getId(), null, null, year, month);
            dto.setTotalContribution(fundIncome);

            double fundExpenditure = fundTransactionRepository.sumWithdrawals(fund.getId(), null, null, year, month);
            dto.setTotalWithdrawal(fundExpenditure);

            double fundPayment = paymentReqRepository.sumPayments(fund.getId(), null, null, year, month);
            dto.setTotalPayment(fundPayment);

            dto.setTotalBalance(fundIncome - (fundExpenditure + fundPayment));

            // Lấy danh sách phòng ban có nhân viên đóng góp
            List<DepartmentDetailResponse> departmentDetails = fundPermissionRepository.findDepartmentDetailsByFundId(fund.getId());
            // Sắp xếp theo tên phòng ban
            departmentDetails.sort(Comparator.comparing(DepartmentDetailResponse::getName, vietnameseCollator));
            dto.setDepartment(departmentDetails);

            report.add(dto);
        }
        // Sắp xếp theo tên
        List<FundDetailsReportResponse> sortedResponses = report.stream()
                .sorted(Comparator.comparing(FundDetailsReportResponse::getFundName, vietnameseCollator))
                .toList();

        return sortedResponses;
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
        if(!userRepository.existsByIdAndRolesId(userId, "USER_MANAGER")){
            throw new AppException(ErrorCode.USER_NO_TREASURER_PERMISSION);
        }
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
