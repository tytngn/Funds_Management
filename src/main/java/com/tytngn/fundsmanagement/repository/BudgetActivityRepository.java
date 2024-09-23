package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.BudgetActivity;
import com.tytngn.fundsmanagement.entity.BudgetEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetActivityRepository extends JpaRepository<BudgetActivity, String> {
    List<BudgetActivity> findByBudgetEstimate(BudgetEstimate budgetEstimate);

    List<BudgetActivity> findByStatus(int status);
}
