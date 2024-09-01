package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Functions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FunctionsRepository extends JpaRepository<Functions, String> {
    boolean existsByName(String name);
}
