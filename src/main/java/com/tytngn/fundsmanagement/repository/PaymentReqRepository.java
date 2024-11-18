package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.dto.response.PaymentReportResponse;
import com.tytngn.fundsmanagement.entity.PaymentReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentReqRepository extends JpaRepository<PaymentReq, String> {

    // đếm số lần gửi đề nghị thanh toán
    int countByStatusAndId(int status, String id);

    // Lấy danh sách đề nghị thanh toán theo bộ lọc
    @Query("SELECT p FROM PaymentReq p " +
            "WHERE (COALESCE(:fundId, '') = '' OR p.fund.id = :fundId) " +
            "AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) " +
            "AND (COALESCE(:status, -1) = -1 OR p.status = :status) " +
            "AND (COALESCE(:departmentId, '') = '' OR p.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR p.user.id = :userId)")
    List<PaymentReq> filterPaymentRequests(@Param("fundId") String fundId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end,
                                           @Param("status") Integer status,
                                           @Param("departmentId") String departmentId,
                                           @Param("userId") String userId);


    // Lấy danh sách đề nghị thanh toán theo bộ lọc và thuộc quỹ do người dùng tạo
    @Query("""
            SELECT p FROM PaymentReq p 
            JOIN p.fund f
            WHERE (COALESCE(:fundId, '') = '' OR p.fund.id = :fundId) 
            AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) 
            AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) 
            AND (COALESCE(:status, -1) = -1 OR p.status = :status) 
            AND (COALESCE(:departmentId, '') = '' OR p.user.department.id = :departmentId) 
            AND (COALESCE(:userId, '') = '' OR p.user.id = :userId)
            AND f.user.id = :treasurerId 
           """)
    List<PaymentReq> filterPaymentRequestsByTreasurer(@Param("fundId") String fundId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end,
                                           @Param("status") Integer status,
                                           @Param("departmentId") String departmentId,
                                           @Param("userId") String userId,
                                           @Param("treasurerId") String treasurerId);


    //  Báo cáo thanh toán cá nhân theo bộ lọc
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.PaymentReportResponse(" +
            "p.fund.fundName, " +
            "SUM(CASE WHEN p.status = 3 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ DUYỆT
            "SUM(CASE WHEN p.status = 5 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ NHẬN
            "COUNT(CASE WHEN p.status = 3 THEN p.id ELSE null END), " + // Số lượng ĐÃ DUYỆT
            "COUNT(CASE WHEN p.status = 5 THEN p.id ELSE null END)) " + // Số lượng ĐÃ NHẬN
            "FROM PaymentReq p " +
            "WHERE p.user.id = :userId " +
            "AND (p.status = 3 OR p.status = 5) " + // Lọc theo trạng thái thanh toán
            "AND (COALESCE(:fundId, '') = '' OR p.fund.id = :fundId) " +
            "AND (:year IS NULL OR YEAR(p.createDate) = :year) " +
            "AND (:month IS NULL OR MONTH(p.createDate) = :month) " +
            "AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) " +
            "GROUP BY p.fund.fundName")
    List<PaymentReportResponse> getIndividualPaymentReport(@Param("userId") String userId,
                                                           @Param("fundId") String fundId,
                                                           @Param("year") Integer year,
                                                           @Param("month") Integer month,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);


    // Báo cáo thanh toán theo thủ quỹ
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.PaymentReportResponse(" +
            "p.fund.fundName, " +
            "SUM(CASE WHEN p.status = 3 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ DUYỆT
            "SUM(CASE WHEN p.status = 4 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ THANH TOÁN
            "COUNT(CASE WHEN p.status = 3 THEN p.id ELSE null END), " + // Số lượng ĐÃ DUYỆT
            "COUNT(CASE WHEN p.status = 4 THEN p.id ELSE null END)) " + // Số lượng ĐÃ THANH TOÁN
            "FROM PaymentReq p " +
            "WHERE p.fund.user.id = :userId " +
            "AND (p.status = 3 OR p.status = 4) " + // Lọc theo trạng thái thanh toán
            "AND (COALESCE(:fundId, '') = '' OR p.fund.id = :fundId) " +
            "AND (:year IS NULL OR YEAR(p.createDate) = :year) " +
            "AND (:month IS NULL OR MONTH(p.createDate) = :month) " +
            "AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) " +
            "GROUP BY p.fund.fundName")
    List<PaymentReportResponse> getTreasurerPaymentReport(@Param("userId") String userId,
                                                          @Param("fundId") String fundId,
                                                          @Param("year") Integer year,
                                                          @Param("month") Integer month,
                                                          @Param("start") LocalDateTime start,
                                                          @Param("end") LocalDateTime end);


    // Báo cáo thanh toán
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.PaymentReportResponse(" +
            "p.fund.fundName, " +
            "SUM(CASE WHEN p.status = 3 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ DUYỆT
            "SUM(CASE WHEN p.status = 4 THEN p.amount ELSE 0 END), " + // Tổng tiền ĐÃ THANH TOÁN
            "COUNT(CASE WHEN p.status = 3 THEN p.id ELSE null END), " + // Số lượng ĐÃ DUYỆT
            "COUNT(CASE WHEN p.status = 4 THEN p.id ELSE null END)) " + // Số lượng ĐÃ THANH TOÁN
            "FROM PaymentReq p " +
            "WHERE (p.status = 3 OR p.status = 4) " + // Lọc theo trạng thái thanh toán
            "AND (COALESCE(:fundId, '') = '' OR p.fund.id = :fundId) " +
            "AND (:year IS NULL OR YEAR(p.createDate) = :year) " +
            "AND (:month IS NULL OR MONTH(p.createDate) = :month) " +
            "AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) " +
            "GROUP BY p.fund.fundName")
    List<PaymentReportResponse> getPaymentReport( @Param("fundId") String fundId,
                                                  @Param("year") Integer year,
                                                  @Param("month") Integer month,
                                                  @Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);


    // Báo cáo chi tiết quỹ: Tính tổng thanh toán của quỹ
    @Query("SELECT COALESCE(SUM(pr.amount), 0) FROM PaymentReq pr WHERE pr.fund.id = :fundId " +
            "AND (pr.status = 4 OR pr.status = 5) " + // trạng thái đã thanh toán hoặc đã nhận
            "AND (COALESCE(:startDate, null) IS NULL OR pr.updateDate >= :startDate) " +
            "AND (COALESCE(:endDate, null) IS NULL OR pr.updateDate <= :endDate) " +
            "AND (COALESCE(:year, null ) IS NULL OR YEAR(pr.updateDate) = :year) " +
            "AND (COALESCE(:month, null) IS NULL OR MONTH(pr.updateDate) = :month)")
    double sumPayments(
            @Param("fundId") String fundId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("year") Integer year,
            @Param("month") Integer month);
}

