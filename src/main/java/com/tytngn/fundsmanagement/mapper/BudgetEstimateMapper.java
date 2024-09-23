package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.BudgetEstimateRequest;
import com.tytngn.fundsmanagement.dto.response.BudgetEstimateResponse;
import com.tytngn.fundsmanagement.entity.BudgetEstimate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BudgetEstimateMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "fundName", ignore = true)
    BudgetEstimate toBudgetEstimate(BudgetEstimateRequest request);

    @Mapping(target = "user", source = "user")
    BudgetEstimateResponse toBudgetEstimateResponse(BudgetEstimate budgetEstimate);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "fundName", ignore = true)
    void updateBudgetEstimate(@MappingTarget BudgetEstimate budgetEstimate, BudgetEstimateRequest request);
}
