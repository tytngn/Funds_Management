package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.BudgetActivityRequest;
import com.tytngn.fundsmanagement.dto.response.BudgetActivityResponse;
import com.tytngn.fundsmanagement.entity.BudgetActivity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BudgetActivityMapper {

    @Mapping(target = "budgetEstimate", ignore = true)
    @Mapping(target = "paymentReq", ignore = true)
    BudgetActivity toBudgetActivity(BudgetActivityRequest request);

    BudgetActivityResponse toBudgetActivityResponse(BudgetActivity budgetActivity);

    @Mapping(target = "budgetEstimate", ignore = true)
    @Mapping(target = "paymentReq", ignore = true)
    void updateBudgetActivity(@MappingTarget BudgetActivity budgetActivity, BudgetActivityRequest request);
}
