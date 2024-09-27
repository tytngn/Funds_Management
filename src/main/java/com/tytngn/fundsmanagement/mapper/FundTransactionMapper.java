package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.FundTransactionRequest;
import com.tytngn.fundsmanagement.dto.response.FundContributionResponse;
import com.tytngn.fundsmanagement.dto.response.FundTransactionResponse;
import com.tytngn.fundsmanagement.entity.FundTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FundTransactionMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "transactionType", ignore = true)
    FundTransaction toFundTransaction(FundTransactionRequest request);

    @Mapping(target = "user", source = "user")
    @Mapping(target = "fund", source = "fund")
    @Mapping(target = "transactionType", source = "transactionType")
    FundTransactionResponse toFundTransactionResponse(FundTransaction fundTransaction);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "transactionType", ignore = true)
    void updateFundTransaction(@MappingTarget FundTransaction fundTransaction, FundTransactionRequest request);

    FundContributionResponse toFundContributionResponse(String fullname, String transactionType, Double total);
}
