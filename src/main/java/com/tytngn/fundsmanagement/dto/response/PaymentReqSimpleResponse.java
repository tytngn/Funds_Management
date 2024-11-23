package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentReqSimpleResponse {
    String id;
    double amount;
    int status;
    int requestCount;
    String description;
    LocalDateTime createDate;
    LocalDateTime updateDate;

    UserSimpleResponse user;
    FundSimpleResponse fund;
}
