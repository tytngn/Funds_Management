package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetActivityRequest {

    @NotBlank(message = "BLANK_NAME")
    String name;

    LocalDate activityDate;

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double amount;

    @NotNull(message = "DATA_INVALID")
    int status;

    String unit;
    float quantity;
    String description;

    String budgetEstimate;
    String paymentReq;
}
