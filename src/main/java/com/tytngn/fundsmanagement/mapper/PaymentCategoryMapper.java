package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.PaymentCategoryRequest;
import com.tytngn.fundsmanagement.dto.response.PaymentCategoryResponse;
import com.tytngn.fundsmanagement.entity.PaymentCategory;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PaymentCategoryMapper {

    PaymentCategory toPaymentCategory(PaymentCategoryRequest request);

    PaymentCategoryResponse toPaymentCategoryResponse(PaymentCategory paymentCategory);

    void updatePaymentCategory(@MappingTarget PaymentCategory paymentCategory, PaymentCategoryRequest request);
}
