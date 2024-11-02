package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentReqResponse {
    String id;
    double amount;
    int status;
    String description;
    LocalDateTime createDate;
    LocalDateTime updateDate;

    UserSimpleResponse user;
    FundSimpleResponse fund;
    Set<InvoiceResponse> invoices;
    List<ImageResponse> images;
//    PaymentCategoryResponse category;
}
