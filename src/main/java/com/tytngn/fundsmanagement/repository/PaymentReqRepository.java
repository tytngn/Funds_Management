package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.PaymentReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentReqRepository extends JpaRepository<PaymentReq, String> {
}
