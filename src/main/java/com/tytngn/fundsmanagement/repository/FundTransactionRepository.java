package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, String> {

    @Query("SELECT u.fullname, SUM(ft.amount) AS totalAmount, tt.name FROM FundTransaction ft " +
            "INNER JOIN ft.user u " +
            "INNER JOIN ft.transactionType tt " +
            "WHERE ft.fund.id = :fundId AND tt.status = 1 " +
            "GROUP BY u.id, u.fullname, tt.name")
    List<Object[]> getFundTransactionSummary(@Param("fundId") String fundId);

    @Query("SELECT f FROM FundTransaction f " +
            "WHERE (:fundId IS NULL OR f.fund.id = :fundId) " +
            "AND (:transactionTypeId IS NULL OR f.transactionType.id = :transactionTypeId)")
    List<FundTransaction> findByFundIdAndTransactionTypeId(@Param("fundId") String fundId, @Param("transactionTypeId") String transactionTypeId);

    @Query("SELECT ft FROM FundTransaction ft " +
            "WHERE (:start IS NULL OR ft.transDate >= :start) " +
            "AND (:end IS NULL OR ft.transDate <= :end)")
    List<FundTransaction> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT ft FROM FundTransaction ft WHERE "
            + "(:fundId IS NULL OR ft.fund.id = :fundId) AND "
            + "(:transTypeId IS NULL OR ft.transactionType.id = :transTypeId) AND "
            + "(:start IS NULL OR ft.transDate >= :start) AND "
            + "(:end IS NULL OR ft.transDate <= :end)")
    List<FundTransaction> findTransactions(
            @Param("fundId") String fundId,
            @Param("transTypeId") String transTypeId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

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

}

