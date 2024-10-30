package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundTransactionResponse {
    String id;
    double amount;
    String description;
    int status;
    LocalDateTime transDate;

    UserSimpleResponse user;
    FundSimpleResponse fund;
    TransactionTypeResponse transactionType;
    List<ImageResponse> images;
}
