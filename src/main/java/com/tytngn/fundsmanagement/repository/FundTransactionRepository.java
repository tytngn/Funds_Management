package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundTransactionRepository extends JpaRepository<FundTransaction, String> {
}
