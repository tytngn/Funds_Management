package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.TransactionTypeRequest;
import com.tytngn.fundsmanagement.dto.response.TransactionTypeResponse;
import com.tytngn.fundsmanagement.entity.TransactionType;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TransactionTypeMapper {

    // Tạo TransactionType
    TransactionType toTransactionType(TransactionTypeRequest request);

    TransactionTypeResponse toTransactionTypeResponse(TransactionType transactionType);

    void updateTransactionType(@MappingTarget TransactionType transactionType, TransactionTypeRequest request);
}
