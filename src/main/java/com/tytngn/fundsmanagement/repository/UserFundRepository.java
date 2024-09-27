package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.dto.response.FundMemberResponse;
import com.tytngn.fundsmanagement.entity.UserFund;
import com.tytngn.fundsmanagement.entity.UserFundId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFundRepository extends JpaRepository<UserFund, UserFundId> {
    // Lấy danh sách các quỹ mà một nhân viên có thể đóng góp
    List<UserFund> findByUserId(String userId);

    // Lấy tất cả người dùng có thể giao dịch với một quỹ cụ thể
    List<UserFund> findByFundId(String fundId);

    @Query(value = """
        SELECT u.id, u.username, u.email, u.fullname, uf.status
        from user u
        JOIN user_fund uf ON uf.user_id = u.id
        WHERE uf.fund_id = :fundId
        """, nativeQuery = true)
    List<Object[]> findFundMemberByFundId(@Param("fundId") String fundId);

    // Kiểm tra quyền đóng góp của một nhân viên vào một quỹ cụ thể
    Optional<UserFund> findByUserIdAndFundId(String userId, String fundId);


}
