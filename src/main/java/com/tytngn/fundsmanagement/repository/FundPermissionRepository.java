package com.tytngn.fundsmanagement.repository;

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

    void deleteFundPermissionById(String id);

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

}
