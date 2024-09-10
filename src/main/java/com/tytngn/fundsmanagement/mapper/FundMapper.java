package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.FundRequest;
import com.tytngn.fundsmanagement.dto.response.FundResponse;
import com.tytngn.fundsmanagement.entity.Fund;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FundMapper {

    // Tạo fund
    @Mapping(target = "user", ignore = true)
    Fund toFund(FundRequest request);

    @Mapping(target = "user", source = "user")
    FundResponse toFundResponse(Fund fund);

    @Mapping(target = "user", ignore = true)
    void updateFund(@MappingTarget Fund fund, FundRequest request);
}
