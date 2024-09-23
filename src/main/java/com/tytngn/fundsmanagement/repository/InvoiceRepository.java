package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.Invoice;
import com.tytngn.fundsmanagement.entity.PaymentReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByPaymentReq(PaymentReq paymentReq);
}
