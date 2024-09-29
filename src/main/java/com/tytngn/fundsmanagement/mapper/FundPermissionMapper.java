package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.FundPermissionRequest;
import com.tytngn.fundsmanagement.dto.response.FundPermissionResponse;
import com.tytngn.fundsmanagement.entity.FundPermission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FundPermissionMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    FundPermission toFundPermission(FundPermissionRequest request);

    @Mapping(target = "user", source = "user")
    @Mapping(target = "fund", source = "fund")
    FundPermissionResponse toResponse(FundPermission fundPermission);

}
