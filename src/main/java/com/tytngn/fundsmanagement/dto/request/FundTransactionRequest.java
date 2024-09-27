package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundTransactionRequest {

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double amount;

    @NotNull(message = "DATA_INVALID")
    int status = 1;

    @NotNull(message = "DATA_INVALID")
    String description;

    String fund;
    String transactionType;
}
