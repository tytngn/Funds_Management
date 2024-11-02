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
    // lấy danh sách quỹ theo trạng thái
    List<Fund> findByStatus(int status);

    // lấy danh sách quỹ theo thủ quỹ
    List<Fund> findByUserIdAndStatus(String userId, int status);

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
                           @Param("userId") String userId);


    // Báo cáo tổng quan quỹ
    @Query("SELECT f FROM Fund f WHERE " +
            "(COALESCE(:year, null) IS NULL OR YEAR(f.createDate) = :year) AND " +
            "(COALESCE(:month, null) IS NULL OR MONTH(f.createDate) = :month) AND " +
            "(COALESCE(:start, null) IS NULL OR f.createDate >= :start) AND " +
            "(COALESCE(:end, null) IS NULL OR f.createDate <= :end)")
    List<Fund> findFundsByDateFilter(@Param("year") Integer year,
                                     @Param("month") Integer month,
                                     @Param("start") LocalDate start,
                                     @Param("end") LocalDate end);


    // Báo cáo chi tiết quỹ
//    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.FundReportResponse(f.fundName, f.balance, u.fullname, f.status, " +
//            "(SELECT COUNT(fp1) FROM FundPermission fp1 WHERE fp1.fund.id = f.id AND fp1.canContribute = true), " +
//            "(SELECT COUNT(fp2) FROM FundPermission fp2 WHERE fp2.fund.id = f.id AND fp2.canWithdraw = true)) " +
//            "FROM Fund f JOIN f.user u " +
//            "WHERE (:year IS NULL OR YEAR(f.createDate) = :year) " +
//            "AND (:month IS NULL OR MONTH(f.createDate) = :month) " +
//            "AND (:startDate IS NULL OR f.createDate >= :startDate) " +
//            "AND (:endDate IS NULL OR f.createDate <= :endDate)")
//    List<FundReportResponse> getFundReport(
//            @Param("year") Integer year,
//            @Param("month") Integer month,
//            @Param("startDate") LocalDate startDate,
//            @Param("endDate") LocalDate endDate
//    );
}
