package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.UserFundRequest;
import com.tytngn.fundsmanagement.dto.response.UserFundResponse;
import com.tytngn.fundsmanagement.entity.UserFund;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserFundMapper {


    UserFund toUserFund(UserFundRequest request);


    UserFundResponse toUserFundResponse (UserFund userFund);

}
