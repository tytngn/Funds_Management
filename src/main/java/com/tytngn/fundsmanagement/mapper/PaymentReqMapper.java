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
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "amount", ignore = true)
    PaymentReq toPaymentReq(PaymentReqRequest request);

    @Mapping(target = "user", source = "user")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "invoices", source = "invoices")
    PaymentReqResponse toPaymentReqResponse(PaymentReq paymentReq);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "amount", ignore = true)
    void updatePaymentReq(@MappingTarget PaymentReq paymentReq, PaymentReqRequest request);
}
