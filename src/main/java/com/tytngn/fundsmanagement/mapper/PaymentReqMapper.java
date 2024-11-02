package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.PaymentReqRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentReqResponse;
import com.tytngn.fundsmanagement.entity.PaymentReq;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentReqMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "images", ignore = true)
    PaymentReq toPaymentReq(PaymentReqRequest request);

    @Mapping(target = "user", source = "user")
    @Mapping(target = "fund", source = "fund")
    @Mapping(target = "invoices", source = "invoices")
    PaymentReqResponse toPaymentReqResponse(PaymentReq paymentReq);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updatePaymentReq(@MappingTarget PaymentReq paymentReq, PaymentReqRequest request);
}
