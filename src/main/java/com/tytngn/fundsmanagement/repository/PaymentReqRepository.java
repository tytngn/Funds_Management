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

    // Lấy danh sách đề nghị thanh toán theo bộ lọc
    @Query("SELECT p FROM PaymentReq p " +
            "WHERE (COALESCE(:categoryId, '') = '' OR p.category.id = :categoryId) " +
            "AND (COALESCE(:start, null) IS NULL OR p.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR p.createDate <= :end) " +
            "AND (COALESCE(:status, -1) = -1 OR p.status = :status) " +
            "AND (COALESCE(:departmentId, '') = '' OR p.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR p.user.id = :userId)")
    List<PaymentReq> filterPaymentRequests(@Param("categoryId") String categoryId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end,
                                           @Param("status") Integer status,
                                           @Param("departmentId") String departmentId,
                                           @Param("userId") String userId);

}

