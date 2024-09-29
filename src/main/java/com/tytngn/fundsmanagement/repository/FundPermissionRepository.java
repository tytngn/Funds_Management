package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.FundPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundPermissionRepository extends JpaRepository<FundPermission, String> {

    List<FundPermission> findByFundId(String fundId);

    FundPermission findByUserIdAndFundId(String userId, String fundId);

    void deleteFundPermissionById(String id);



//    @Query(value = """
//        SELECT u.id, u.username, u.email, u.fullname, uf.status
//        from user u
//        JOIN user_fund uf ON uf.user_id = u.id
//        WHERE uf.fund_id = :fundId
//        """, nativeQuery = true)
//    List<Object[]> findFundMemberByFundId(@Param("fundId") String fundId);
}
