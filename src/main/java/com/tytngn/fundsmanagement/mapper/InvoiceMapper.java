package com.tytngn.fundsmanagement.mapper;

import com.tytngn.fundsmanagement.dto.request.InvoiceRequest;
import com.tytngn.fundsmanagement.dto.response.InvoiceResponse;
import com.tytngn.fundsmanagement.entity.Invoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    @Mapping(target = "paymentReq", ignore = true)
    @Mapping(target = "images", ignore = true)
    Invoice toInvoice(InvoiceRequest request);

    InvoiceResponse toInvoiceResponse(Invoice invoice);

    @Mapping(target = "paymentReq", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateInvoice(@MappingTarget Invoice invoice, InvoiceRequest request);
}
