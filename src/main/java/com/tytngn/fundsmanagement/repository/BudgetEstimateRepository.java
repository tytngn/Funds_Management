package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.BudgetEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetEstimateRepository extends JpaRepository<BudgetEstimate, String> {

    // lấy danh sách dự trù ngân sách theo các bộ lọc (theo quỹ, thời gian, trạng thái, phòng ban, cá nhân)
    @Query("SELECT b FROM BudgetEstimate b " +
            "WHERE (COALESCE(:fundId, '') = '' OR b.fund.id = :fundId) " +
            "AND (COALESCE(:start, null) IS NULL OR b.createdDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR b.createdDate <= :end) " +
            "AND (COALESCE(:status, -1) = -1 OR b.status = :status) " +
            "AND (COALESCE(:departmentId, '') = '' OR b.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR b.user.id = :userId)")
    List<BudgetEstimate> filterBudgetEstimates(@Param("fundId") String fundId,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end,
                                               @Param("status") Integer status,
                                               @Param("departmentId") String departmentId,
                                               @Param("userId") String userId);

}
