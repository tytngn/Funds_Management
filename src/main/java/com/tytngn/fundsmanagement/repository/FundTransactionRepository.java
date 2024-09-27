package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, String> {

//    @Query("SELECT SUM(ft.amount) FROM FundTransaction ft WHERE ft.user.id = :userId AND ft.fund.id = :fundId AND ft.status = 2")
//    double findTotalContributionByUserAndFund(@Param("userId") String userId, @Param("fundId") String fundId);

//    @Query("SELECT SUM(ft.amount) FROM FundTransaction ft WHERE ft.user.id = :userId AND ft.fund.id = :fundId")
//    Double getTotalAmountByUserAndFund(@Param("userId") String userId, @Param("fundId") String fundId);

    @Query("SELECT u.fullname, SUM(ft.amount) AS totalAmount, tt.name FROM FundTransaction ft " +
            "INNER JOIN ft.user u " +
            "INNER JOIN ft.transactionType tt " +
            "WHERE ft.fund.id = :fundId AND tt.status = 1 " +
            "GROUP BY u.id, u.fullname, tt.name")
    List<Object[]> getFundTransactionSummary(@Param("fundId") String fundId);

}
