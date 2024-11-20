package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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


    // Báo cáo chi tiết quỹ: lấy danh sách quỹ theo bộ lọc (năm, tháng, từ ngày đến ngày)
    @Query("SELECT DISTINCT f FROM Fund f " +
            "LEFT JOIN FundTransaction ft ON ft.fund = f AND ft.status = 2 " +
            "LEFT JOIN PaymentReq pr ON pr.fund = f AND (pr.status = 4 OR pr.status = 5) " +
            "LEFT JOIN FundPermission fp ON fp.fund = f " +
            "WHERE (COALESCE(:startDate, null) IS NULL OR " +
            "       (ft.confirmDate >= :startDate OR pr.updateDate >= :startDate OR fp.grantedDate >= :startDate OR f.createDate >= :startDate)) " +
            "AND (COALESCE(:endDate, null) IS NULL OR " +
            "     (ft.confirmDate <= :endDate OR pr.updateDate <= :endDate OR fp.grantedDate <= :endDate OR f.createDate <= :endDate)) " +
            "AND (COALESCE(:year, null) IS NULL OR " +
            "     (YEAR(ft.confirmDate) = :year OR YEAR(pr.updateDate) = :year OR YEAR(fp.grantedDate) = :year OR YEAR(f.createDate) = :year)) " +
            "AND (COALESCE(:month, null) IS NULL OR " +
            "     (MONTH(ft.confirmDate) = :month OR MONTH(pr.updateDate) = :month OR MONTH(fp.grantedDate) = :month OR MONTH(f.createDate) = :month)) " +
            "AND (ft IS NOT NULL OR pr IS NOT NULL OR (fp IS NOT NULL AND fp.grantedDate IS NOT NULL) OR f.createDate IS NOT NULL)")
    List<Fund> findFundsByFilters ( @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate,
                                    @Param("year") Integer year,
                                    @Param("month") Integer month);


    // Báo cáo chi tiết quỹ: lấy danh sách quỹ theo bộ lọc (năm, tháng, từ ngày đến ngày) và do thủ quỹ quản lý
    @Query("SELECT DISTINCT f FROM Fund f " +
            "LEFT JOIN FundTransaction ft ON ft.fund = f AND ft.status = 2 " +
            "LEFT JOIN PaymentReq pr ON pr.fund = f AND (pr.status = 4 OR pr.status = 5) " +
            "LEFT JOIN FundPermission fp ON fp.fund = f " +
            "WHERE (COALESCE(:startDate, null) IS NULL OR " +
            "       (ft.confirmDate >= :startDate OR pr.updateDate >= :startDate OR fp.grantedDate >= :startDate OR f.createDate >= :startDate)) " +
            "AND (COALESCE(:endDate, null) IS NULL OR " +
            "     (ft.confirmDate <= :endDate OR pr.updateDate <= :endDate OR fp.grantedDate <= :endDate OR f.createDate <= :endDate)) " +
            "AND (COALESCE(:year, null) IS NULL OR " +
            "     (YEAR(ft.confirmDate) = :year OR YEAR(pr.updateDate) = :year OR YEAR(fp.grantedDate) = :year OR YEAR(f.createDate) = :year)) " +
            "AND (COALESCE(:month, null) IS NULL OR " +
            "     (MONTH(ft.confirmDate) = :month OR MONTH(pr.updateDate) = :month OR MONTH(fp.grantedDate) = :month OR MONTH(f.createDate) = :month)) " +
            "AND (COALESCE(:userId, '') = '' OR f.user.id = :userId)" +
            "AND (ft IS NOT NULL OR pr IS NOT NULL OR (fp IS NOT NULL AND fp.grantedDate IS NOT NULL) OR f.createDate IS NOT NULL)")
    List<Fund> findFundsByTreasurer(@Param("userId") String userId,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate,
                                    @Param("year") Integer year,
                                    @Param("month") Integer month);
}
