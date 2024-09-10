package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundTransactionRequest {

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double amount;

    LocalDateTime transDate;
    String user;
    String fund;
    String transactionType;
}
