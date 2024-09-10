package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionTypeRepository extends JpaRepository<TransactionType, String> {
    boolean existsByName(String name);
}
