package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundTransactionResponse {
    String id;
    double amount;
    LocalDateTime transDate;

    UserSimpleResponse user;
    FundSimpleResponse fund;
    TransactionTypeResponse transactionType;

}
