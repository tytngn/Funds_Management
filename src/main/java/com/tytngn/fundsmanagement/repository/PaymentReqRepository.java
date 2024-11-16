package com.tytngn.fundsmanagement.repository;

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

