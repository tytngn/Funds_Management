package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.BudgetEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetEstimateRepository extends JpaRepository<BudgetEstimate, String> {
}
