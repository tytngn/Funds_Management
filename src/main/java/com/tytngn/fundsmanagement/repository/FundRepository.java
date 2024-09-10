package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundRepository extends JpaRepository<Fund, String> {
}
