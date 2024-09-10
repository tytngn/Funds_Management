package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.PaymentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentCategoryRepository extends JpaRepository<PaymentCategory, String> {
    boolean existsByName(String name);
}
