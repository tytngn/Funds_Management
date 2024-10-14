package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FundRepository extends JpaRepository<Fund, String> {
    List<Fund> findByStatus(int status);

    // Lấy danh sách quỹ theo bộ lọc (theo thời gian, theo trạng thái, theo phòng ban, theo thủ quỹ)
    @Query("SELECT f FROM Fund f " +
            "WHERE (COALESCE(:start, null) IS NULL OR f.createDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR f.createDate <= :end) " +
            "AND (COALESCE(:status, -1) = -1 OR f.status = :status) " +
            "AND (COALESCE(:departmentId, '') = '' OR f.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR f.user.id = :userId)")
    List<Fund> filterFunds(@Param("start") LocalDate start,
                           @Param("end") LocalDate end,
                           @Param("status") Integer status,
                           @Param("departmentId") String departmentId,
                           @Param("userId") String userId
    );
}
