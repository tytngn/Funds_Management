package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.AccountUpdateRequest;
import com.tytngn.fundsmanagement.dto.request.BankAccountRequest;
import com.tytngn.fundsmanagement.dto.response.BankAccountResponse;
import com.tytngn.fundsmanagement.entity.BankAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {

    @Mapping(target = "user", ignore = true)
    BankAccount toBankAccount(BankAccountRequest request);

    @Mapping(target = "user", source = "user")
    @Mapping(target = "id", source = "id")
    BankAccountResponse toBankAccountResponse(BankAccount bankAccount);

    @Mapping(target = "user", ignore = true)
    void updateBankAccount(@MappingTarget BankAccount bankAccount, BankAccountRequest request);


    @Mapping(target = "bankName", source = "bankName")
    @Mapping(target = "accountNumber", source = "accountNumber")
    void updateBankAccounts(@MappingTarget BankAccount bankAccount, AccountUpdateRequest request);
}
