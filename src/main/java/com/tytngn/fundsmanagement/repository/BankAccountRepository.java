package com.tytngn.fundsmanagement.repository;

import com.tytngn.fundsmanagement.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {
    boolean existsByAccountNumberAndBankName(String accountNumber, String bankName);

}
