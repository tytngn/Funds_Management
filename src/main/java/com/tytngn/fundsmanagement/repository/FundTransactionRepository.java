package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.dto.response.TransactionReportResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, String> {

    // Lấy danh sách giao dịch theo bộ lọc (theo quỹ, theo loại giao dịch, theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái)
    @Query("SELECT t FROM FundTransaction t " +
            "WHERE (COALESCE(:fundId, '') = '' OR t.fund.id = :fundId) " +
            "AND (COALESCE(:transTypeId, '') = '' OR t.transactionType.id = :transTypeId) " +
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " +
            "AND (COALESCE(:departmentId, '') = '' OR t.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR t.user.id = :userId) " +
            "AND (COALESCE(:status, -1) = -1 OR t.status = :status)")
    List<FundTransaction> filterTransactions(@Param("fundId") String fundId,
                                         @Param("transTypeId") String transTypeId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end,
                                         @Param("departmentId") String departmentId,
                                         @Param("userId") String userId,
                                         @Param("status") Integer status
    );


    // Lấy danh sách giao dịch do thủ quỹ quản lý theo bộ lọc (theo quỹ, theo loại giao dịch, theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái)
    @Query("SELECT t FROM FundTransaction t " +
            "WHERE (COALESCE(:fundId, '') = '' OR t.fund.id = :fundId) " +
            "AND (COALESCE(:transTypeId, '') = '' OR t.transactionType.id = :transTypeId) " +
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " +
            "AND (COALESCE(:departmentId, '') = '' OR t.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR t.user.id = :userId) " +
            "AND (COALESCE(:status, -1) = -1 OR t.status = :status)" +
            "AND t.fund.user.id = :treasurerId")
    List<FundTransaction> filterTransactionsByTreasurer(@Param("fundId") String fundId,
                                             @Param("transTypeId") String transTypeId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end,
                                             @Param("departmentId") String departmentId,
                                             @Param("userId") String userId,
                                             @Param("status") Integer status,
                                             @Param("treasurerId") String treasurerId
    );


    // Báo cáo giao dịch cá nhân theo bộ lọc
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.TransactionReportResponse(" +
            "t.fund.fundName, t.transactionType.name, " +
            "SUM(t.amount), " +
            "COUNT(t.id)) " +
            "FROM FundTransaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND (:fundId IS NULL OR t.fund.id = :fundId) " + // Lọc theo quỹ
            "AND (:transTypeId IS NULL OR t.transactionType.id = :transTypeId) " + // Lọc theo loại giao dịch
            "AND (:transTypeStatus IS NULL OR t.transactionType.status = :transTypeStatus) " + // Lọc theo trạng thái giao dịch (0 hoặc 1)
            "AND (:year IS NULL OR YEAR(t.transDate) = :year) " + // Lọc theo năm
            "AND (:month IS NULL OR MONTH(t.transDate) = :month) " + // Lọc theo tháng
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " + // Lọc theo ngày bắt đầu
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " + // Lọc theo ngày kết thúc
            "GROUP BY t.fund.fundName, t.transactionType.name")
    List<TransactionReportResponse> getIndividualTransactionReport(@Param("userId") String userId,
                                                                   @Param("fundId") String fundId,
                                                                   @Param("transTypeId") String transTypeId,
                                                                   @Param("transTypeStatus") Integer transTypeStatus,
                                                                   @Param("year") Integer year,
                                                                   @Param("month") Integer month,
                                                                   @Param("start") LocalDateTime start,
                                                                   @Param("end") LocalDateTime end);


    // Báo cáo giao dịch đóng góp theo thủ quỹ
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.TransactionReportResponse(" +
            "t.fund.fundName, t.transactionType.name, " +
            "SUM(t.amount), " +
            "COUNT(t.id)) " +
            "FROM FundTransaction t " +
            "WHERE t.fund.user.id = :userId " +
            "AND t.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND (COALESCE(:fundId, '') = '' OR t.fund.id = :fundId) " + // Lọc theo quỹ
            "AND (COALESCE(:transTypeId, '') = '' OR t.transactionType.id = :transTypeId)  " + // Lọc theo loại giao dịch
            "AND t.transactionType.status = 1 " + // Lọc theo trạng thái giao dịch đóng góp
            "AND (:year IS NULL OR YEAR(t.transDate) = :year) " + // Lọc theo năm
            "AND (:month IS NULL OR MONTH(t.transDate) = :month) " + // Lọc theo tháng
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " + // Lọc theo ngày bắt đầu
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " + // Lọc theo ngày kết thúc
            "GROUP BY t.fund.fundName, t.transactionType.name")
    List<TransactionReportResponse> getContributionTransactionReport(@Param("userId") String userId,
                                                                   @Param("fundId") String fundId,
                                                                   @Param("transTypeId") String transTypeId,
                                                                   @Param("year") Integer year,
                                                                   @Param("month") Integer month,
                                                                   @Param("start") LocalDateTime start,
                                                                   @Param("end") LocalDateTime end);


    // Báo cáo giao dịch dựa trên các bộ lọc
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.TransactionReportResponse(" +
            "t.fund.fundName, t.transactionType.name, " +
            "SUM(t.amount), " +
            "COUNT(t.id)) " +
            "FROM FundTransaction t " +
            "WHERE t.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND (COALESCE(:fundId, '') = '' OR t.fund.id = :fundId) " + // Lọc theo quỹ
            "AND (COALESCE(:transTypeId, '') = '' OR t.transactionType.id = :transTypeId)  " + // Lọc theo loại giao dịch
            "AND (:transTypeStatus IS NULL OR t.transactionType.status = :transTypeStatus) " + // Lọc theo trạng thái giao dịch (0 hoặc 1)
            "AND (:year IS NULL OR YEAR(t.transDate) = :year) " + // Lọc theo năm
            "AND (:month IS NULL OR MONTH(t.transDate) = :month) " + // Lọc theo tháng
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " + // Lọc theo ngày bắt đầu
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " + // Lọc theo ngày kết thúc
            "GROUP BY t.fund.fundName, t.transactionType.name")
    List<TransactionReportResponse> getTransactionReport(@Param("fundId") String fundId,
                                                         @Param("transTypeId") String transTypeId,
                                                         @Param("transTypeStatus") Integer transTypeStatus,
                                                         @Param("year") Integer year,
                                                         @Param("month") Integer month,
                                                         @Param("start") LocalDateTime start,
                                                         @Param("end") LocalDateTime end);


    // Báo cáo chi tiết quỹ: Tính tổng thu của quỹ
    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FundTransaction ft WHERE ft.fund.id = :fundId " +
            "AND ft.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND ft.transactionType.status = 1 " +
            "AND (COALESCE(:startDate, null) IS NULL OR ft.confirmDate >= :startDate) " +
            "AND (COALESCE(:endDate, null) IS NULL OR ft.confirmDate <= :endDate) " +
            "AND (COALESCE(:year, null ) IS NULL OR YEAR(ft.confirmDate) = :year) " +
            "AND (COALESCE(:month, null) IS NULL OR MONTH(ft.confirmDate) = :month)")
    double sumContributions(
            @Param("fundId") String fundId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("year") Integer year,
            @Param("month") Integer month);


    // Báo cáo chi tiết quỹ: Tính tổng chi của quỹ
    @Query("SELECT COALESCE(SUM(ft.amount), 0) FROM FundTransaction ft WHERE ft.fund.id = :fundId " +
            "AND ft.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND ft.transactionType.status = 0 " +
            "AND (COALESCE(:startDate, null) IS NULL OR ft.confirmDate >= :startDate) " +
            "AND (COALESCE(:endDate, null) IS NULL OR ft.confirmDate <= :endDate) " +
            "AND (COALESCE(:year, null ) IS NULL OR YEAR(ft.confirmDate) = :year) " +
            "AND (COALESCE(:month, null) IS NULL OR MONTH(ft.confirmDate) = :month)")
    double sumWithdrawals(
            @Param("fundId") String fundId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("year") Integer year,
            @Param("month") Integer month);


    // Số dư đầu kỳ (trước thời gian được chọn)
//    @Query("SELECT COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE -ft.amount END), 0) " +
//            "FROM FundTransaction ft " +
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " + // Chỉ tính các giao dịch đã được duyệt
//            "AND (:selectedYear IS NULL OR YEAR(ft.transDate) < :selectedYear OR " +
//            "(YEAR(ft.transDate) = :selectedYear AND " +
//            "(COALESCE(:selectedMonth, 0) = 0 OR MONTH(ft.transDate) < :selectedMonth))) " +
//            "AND (:startDate IS NULL OR ft.transDate < :startDate)")
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("selectedYear") Integer selectedYear,
//            @Param("selectedMonth") Integer selectedMonth,
//            @Param("startDate") LocalDateTime startDate);

//    @Query("SELECT COALESCE(SUM(CASE " +
//            "WHEN ft.transactionType.status = 1 THEN ft.amount " + // Đóng góp
//            "WHEN ft.transactionType.status = 0 THEN -ft.amount " + // Rút quỹ
//            "ELSE 0 END), 0) " +
//            "- COALESCE(SUM(pr.amount), 0) " + // Thanh toán đã thanh toán hoặc đã nhận
//            "FROM FundTransaction ft " +
//            "LEFT JOIN PaymentReq pr ON pr.fund.id = ft.fund.id AND (pr.status = 4 OR pr.status = 5) " + // Thanh toán đã thanh toán hoặc đã nhận
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " + // Chỉ tính các giao dịch đã được duyệt
//            "AND (:selectedYear IS NULL OR YEAR(ft.transDate) < :selectedYear OR " +
//            "(YEAR(ft.transDate) = :selectedYear AND " +
//            "(COALESCE(:selectedMonth, 0) = 0 OR MONTH(ft.transDate) < :selectedMonth))) " +
//            "AND (:startDate IS NULL OR ft.transDate < :startDate) " +
//            "AND (:selectedYear IS NULL OR YEAR(pr.updateDate) < :selectedYear OR " +
//            "(YEAR(pr.updateDate) = :selectedYear AND " +
//            "(COALESCE(:selectedMonth, 0) = 0 OR MONTH(pr.updateDate) < :selectedMonth))) " +
//            "AND (:startDate IS NULL OR pr.updateDate < :startDate)")
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("selectedYear") Integer selectedYear,
//            @Param("selectedMonth") Integer selectedMonth,
//            @Param("startDate") LocalDateTime startDate);


//    @Query("SELECT " +
//            "(COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE 0 END), 0) " + // Tổng đóng góp
//            "- COALESCE(SUM(CASE WHEN ft.transactionType.status = 0 THEN ft.amount ELSE 0 END), 0) " + // Trừ rút quỹ
//            "- COALESCE((SELECT SUM(pr.amount) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
//            "AND (pr.status = 4 OR pr.status = 5) " + // Trạng thái "đã thanh toán" hoặc "đã nhận"
//            "AND (:selectedYear IS NULL OR YEAR(pr.updateDate) < :selectedYear OR " +
//            "(YEAR(pr.updateDate) < :selectedYear AND " +
//            "(COALESCE(:selectedMonth, 0) = 0 OR MONTH(pr.updateDate) < :selectedMonth))) " +
//            "AND (:startDate IS NULL OR pr.updateDate < :startDate)), 0)) " + // Trừ thanh toán
//            "FROM FundTransaction ft " +
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " + // Chỉ các giao dịch đã duyệt
//            "AND (:selectedYear IS NULL OR YEAR(ft.transDate) < :selectedYear OR " +
//            "(YEAR(ft.transDate) < :selectedYear AND " +
//            "(COALESCE(:selectedMonth, 0) = 0 OR MONTH(ft.transDate) < :selectedMonth))) " +
//            "AND (:startDate IS NULL OR ft.transDate < :startDate)")
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("selectedYear") Integer selectedYear,
//            @Param("selectedMonth") Integer selectedMonth,
//            @Param("startDate") LocalDateTime startDate);



//    @Query("SELECT " +
//            "(COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE 0 END), 0) " +  // Tổng thu (đóng góp)
//            "- COALESCE(SUM(CASE WHEN ft.transactionType.status = 0 THEN ft.amount ELSE 0 END), 0) " +  // Trừ chi (rút quỹ)
//            "- COALESCE((SELECT SUM(pr.amount) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
//            "AND (pr.status = 4 OR pr.status = 5) " +  // Trạng thái đã thanh toán hoặc đã nhận
//            "AND (:startDate IS NULL OR pr.updateDate < :startDate) " +  // Lọc theo startDate nếu có
//            "AND (:selectedYear IS NULL OR YEAR(pr.updateDate) < :selectedYear) " +  // Lọc theo năm nếu có
//            "AND (:selectedMonth IS NULL OR " +  // Lọc theo tháng nếu có
//            "(YEAR(pr.updateDate) < :selectedYear OR " +
//            "(YEAR(pr.updateDate) = :selectedYear AND MONTH(pr.updateDate) < :selectedMonth)))), 0)) " +  // Xét trước selectedMonth trong cùng năm
//            "FROM FundTransaction ft " +
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " +  // Chỉ lấy các giao dịch đã duyệt
//            "AND (:startDate IS NULL OR ft.confirmDate < :startDate) " +  // Lọc theo startDate nếu có
//            "AND (:selectedYear IS NULL OR YEAR(ft.confirmDate) < :selectedYear) " +  // Lọc theo năm nếu có
//            "AND (:selectedMonth IS NULL OR " +  // Lọc theo tháng nếu có
//            "(YEAR(ft.confirmDate) < :selectedYear OR " +
//            "(YEAR(ft.confirmDate) = :selectedYear AND MONTH(ft.confirmDate) < :selectedMonth)))")  // Xét trước selectedMonth trong cùng năm
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("selectedYear") Integer selectedYear,
//            @Param("selectedMonth") Integer selectedMonth,
//            @Param("startDate") LocalDateTime startDate);


//    @Query("SELECT " +
//            "(COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE 0 END), 0) " +  // Tổng thu (đóng góp)
//            "- COALESCE(SUM(CASE WHEN ft.transactionType.status = 0 THEN ft.amount ELSE 0 END), 0) " +  // Trừ chi (rút quỹ)
//            "- COALESCE((SELECT SUM(pr.amount) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
//            "AND (pr.status = 4 OR pr.status = 5) " +  // Trạng thái đã thanh toán hoặc đã nhận
//            "AND (:startDate IS NULL OR pr.updateDate < :startDate) " +  // Lọc theo startDate nếu có
//            "AND (:selectedYear IS NULL OR YEAR(pr.updateDate) <= :selectedYear) " +  // Lọc theo selectedYear nếu có
//            "AND (:selectedMonth IS NULL OR " +  // Lọc theo selectedMonth nếu có
//            "(YEAR(pr.updateDate) < :selectedYear OR " +
//            "(YEAR(pr.updateDate) = :selectedYear AND MONTH(pr.updateDate) < :selectedMonth)))), 0)) " +  // Xét trước selectedMonth trong cùng năm
//            "FROM FundTransaction ft " +
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " +  // Chỉ lấy các giao dịch đã duyệt
//            "AND (:startDate IS NULL OR ft.confirmDate < :startDate) " +  // Lọc theo startDate nếu có
//            "AND (:selectedYear IS NULL OR YEAR(ft.confirmDate) <= :selectedYear) " +  // Lọc theo selectedYear nếu có
//            "AND (:selectedMonth IS NULL OR " +  // Lọc theo selectedMonth nếu có
//            "(YEAR(ft.confirmDate) < :selectedYear OR " +
//            "(YEAR(ft.confirmDate) = :selectedYear AND MONTH(ft.confirmDate) < :selectedMonth)))")  // Xét trước selectedMonth trong cùng năm
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("selectedYear") Integer selectedYear,
//            @Param("selectedMonth") Integer selectedMonth,
//            @Param("startDate") LocalDateTime startDate);


    @Query("SELECT " +
            "(COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE 0 END), 0) " +  // Tổng thu (đóng góp)
            "- COALESCE(SUM(CASE WHEN ft.transactionType.status = 0 THEN ft.amount ELSE 0 END), 0) " +  // Trừ chi (rút quỹ)
            "+ COALESCE((SELECT SUM(pr.amount) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
            "AND (pr.status = 4 OR pr.status = 5) " +  // Trạng thái đã thanh toán hoặc đã nhận
            "AND (:startDate IS NULL OR pr.updateDate < :startDate) " +  // Lọc theo startDate nếu có
            "AND (:selectedYear IS NULL OR YEAR(pr.updateDate) < :selectedYear OR " +  // Lọc theo selectedYear nếu có
            "(YEAR(pr.updateDate) = :selectedYear AND (:selectedMonth IS NULL OR MONTH(pr.updateDate) < :selectedMonth)))), 0)) " +  // Lọc theo selectedMonth nếu có
            "FROM FundTransaction ft " +
            "WHERE ft.fund.id = :fundId " +
            "AND ft.status = 2 " +  // Chỉ lấy các giao dịch đã duyệt
            "AND (:startDate IS NULL OR ft.confirmDate < :startDate) " +  // Lọc theo startDate nếu có
            "AND (:selectedYear IS NULL OR YEAR(ft.confirmDate) < :selectedYear OR " +  // Lọc theo selectedYear nếu có
            "(YEAR(ft.confirmDate) = :selectedYear AND (:selectedMonth IS NULL OR MONTH(ft.confirmDate) < :selectedMonth)))")  // Lọc theo selectedMonth nếu có
    double calculateBeginningBalance(
            @Param("fundId") String fundId,
            @Param("selectedYear") Integer selectedYear,
            @Param("selectedMonth") Integer selectedMonth,
            @Param("startDate") LocalDateTime startDate);


//    @Query("SELECT " +
//            "(COALESCE(SUM(CASE WHEN ft.transactionType.status = 1 THEN ft.amount ELSE 0 END), 0) " +  // Tổng thu (đóng góp)
//            "- COALESCE(SUM(CASE WHEN ft.transactionType.status = 0 THEN ft.amount ELSE 0 END), 0) " +  // Trừ chi (rút quỹ)
//            "- COALESCE((SELECT SUM(pr.amount) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
//            "AND (pr.status = 4 OR pr.status = 5) " +  // Trạng thái đã thanh toán hoặc đã nhận
//            "AND (:startDate IS NULL OR pr.updateDate < :startDate)), 0)) " +  // Lọc theo startDate nếu có
//            "FROM FundTransaction ft " +
//            "WHERE ft.fund.id = :fundId " +
//            "AND ft.status = 2 " +  // Chỉ lấy các giao dịch đã duyệt
//            "AND (:startDate IS NULL OR ft.confirmDate < :startDate)")  // Lọc theo startDate nếu có
//    double calculateBeginningBalance(
//            @Param("fundId") String fundId,
//            @Param("startDate") LocalDateTime startDate);

}

