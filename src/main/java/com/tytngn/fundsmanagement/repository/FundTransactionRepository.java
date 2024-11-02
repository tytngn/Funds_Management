package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.dto.response.FundTransactionReportResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, String> {

    // Lấy danh sách giao dịch theo bộ lọc (theo quỹ, theo loại giao dịch, theo thời gian, theo phòng ban, theo cá nhân, theo trạng thái
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


    // Lấy báo cáo giao dịch đóng góp của một người dùng theo bộ lọc
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.FundTransactionReportResponse(" +
            "t.fund.fundName, t.transactionType.name, " +
            "SUM(t.amount), " +
            "YEAR(t.transDate), MONTH(t.transDate)) " +
            "FROM FundTransaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 2 " + // Lấy các giao dịch đã được duyệt
            "AND (:year IS NULL OR YEAR(t.transDate) = :year) " +
            "AND (:month IS NULL OR MONTH(t.transDate) = :month) " +
            "AND (COALESCE(:start, null) IS NULL OR t.transDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR t.transDate <= :end) " +
            "GROUP BY t.fund.fundName, t.transactionType.name, YEAR(t.transDate), MONTH(t.transDate)")
    List<FundTransactionReportResponse> getUserFundReport(@Param("userId") String userId,
                                                          @Param("year") Integer year,
                                                          @Param("month") Integer month,
                                                          @Param("start") LocalDateTime start,
                                                          @Param("end") LocalDateTime end);

}

