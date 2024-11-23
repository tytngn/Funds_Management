package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.dto.response.DepartmentDetailResponse;
import com.tytngn.fundsmanagement.dto.response.DepartmentSimpleResponse;
import com.tytngn.fundsmanagement.dto.response.FundDetailsReportResponse;
import com.tytngn.fundsmanagement.entity.Fund;
import com.tytngn.fundsmanagement.entity.FundPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FundPermissionRepository extends JpaRepository<FundPermission, String> {

    List<FundPermission> findByFundId(String fundId);

    FundPermission findByUserIdAndFundId(String userId, String fundId);

    FundPermission findByUserIdAndFundIdAndCanContribute(String userId, String fundId, boolean canContribute);

    void deleteFundPermissionById(String id);

    // Lấy danh sách quỹ mà người dùng có quyền đóng góp
    @Query("SELECT fp.fund FROM FundPermission fp WHERE fp.user.id = :userId AND fp.canContribute = true")
    List<Fund> findFundsWithContributePermission(String userId);

    // Lấy danh sách quỹ mà người dùng có quyền rút quỹ
    @Query("SELECT fp.fund FROM FundPermission fp WHERE fp.user.id = :userId AND fp.canWithdraw = true")
    List<Fund> findFundsWithWithdrawPermission(String userId);

    // Lấy danh sách phân quyền giao dịch quỹ (FundPermission) theo quỹ, theo bộ lọc (theo thời gian, theo trạng thái, theo phòng ban, theo cá nhân)
    @Query("SELECT fp FROM FundPermission fp " +
            "WHERE (COALESCE(:fundId, '') = '' OR fp.fund.id = :fundId) " +
            "AND (COALESCE(:start, null) IS NULL OR fp.grantedDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR fp.grantedDate <= :end) " +
            "AND (COALESCE(:canContribute, null) IS NULL OR fp.canContribute = :canContribute) " +
            "AND (COALESCE(:canWithdraw, null) IS NULL OR fp.canWithdraw = :canWithdraw) " +
            "AND (COALESCE(:departmentId, '') = '' OR fp.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR fp.user.id = :userId)")
    List<FundPermission> filterFundPermissions(@Param("fundId") String fundId,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end,
                                               @Param("canContribute") Boolean canContribute,
                                               @Param("canWithdraw") Boolean canWithdraw,
                                               @Param("departmentId") String departmentId,
                                               @Param("userId") String userId
    );

    // Lấy danh sách phân quyền giao dịch quỹ (FundPermission) theo thủ quỹ, theo bộ lọc (theo quỹ, theo thời gian, theo trạng thái, theo phòng ban, theo cá nhân)
    @Query("SELECT fp FROM FundPermission fp " +
            "WHERE (COALESCE(:fundId, '') = '' OR fp.fund.id = :fundId) " +
            "AND (COALESCE(:start, null) IS NULL OR fp.grantedDate >= :start) " +
            "AND (COALESCE(:end, null) IS NULL OR fp.grantedDate <= :end) " +
            "AND (COALESCE(:canContribute, null) IS NULL OR fp.canContribute = :canContribute) " +
            "AND (COALESCE(:canWithdraw, null) IS NULL OR fp.canWithdraw = :canWithdraw) " +
            "AND (COALESCE(:departmentId, '') = '' OR fp.user.department.id = :departmentId) " +
            "AND (COALESCE(:userId, '') = '' OR fp.user.id = :userId)" +
            "AND fp.fund.user.id = :treasurerId")
    List<FundPermission> filterFundPermissionsByTreasurer(@Param("fundId") String fundId,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end,
                                               @Param("canContribute") Boolean canContribute,
                                               @Param("canWithdraw") Boolean canWithdraw,
                                               @Param("departmentId") String departmentId,
                                               @Param("userId") String userId,
                                               @Param("treasurerId") String treasurerId
    );


    // Báo cáo chi tiết quỹ: Tính số nhân viên đóng góp của quỹ
    @Query("SELECT COUNT(fp) FROM FundPermission fp WHERE fp.fund.id = :fundId " +
            "AND fp.canContribute = true " +
            "AND (COALESCE(:startDate, null) IS NULL OR fp.grantedDate >= :startDate) " +
            "AND (COALESCE(:endDate, null) IS NULL OR fp.grantedDate <= :endDate) " +
            "AND (COALESCE(:year, null ) IS NULL OR YEAR(fp.grantedDate) = :year) " +
            "AND (COALESCE(:month, null) IS NULL OR MONTH(fp.grantedDate) = :month)")
    int countContributors(
            @Param("fundId") String fundId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("year") Integer year,
            @Param("month") Integer month);


    // Lấy danh sách phòng ban có nhân viên đóng góp
    @Query("SELECT new com.tytngn.fundsmanagement.dto.response.DepartmentDetailResponse(d.id, d.name, COUNT(u), COUNT(fp)) " +
            "FROM Department d " +
            "JOIN d.users u " +
            "LEFT JOIN FundPermission fp ON fp.user.id = u.id AND fp.fund.id = :fundId AND fp.canContribute = true " +
            "GROUP BY d.id, d.name")
    List<DepartmentDetailResponse> findDepartmentDetailsByFundId(@Param("fundId") String fundId);
}
