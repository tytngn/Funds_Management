package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.FunctionsRequest;
import com.tytngn.fundsmanagement.dto.response.FunctionSimpleResponse;
import com.tytngn.fundsmanagement.dto.response.FunctionsResponse;
import com.tytngn.fundsmanagement.entity.Functions;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FunctionsMapper {

    // Tạo functions
    Functions toFunctions(FunctionsRequest request);

    // map functions về response
    FunctionsResponse toFunctionsResponse(Functions functions);

    FunctionSimpleResponse toFunctionOnlyResponse(Functions functions);
}
