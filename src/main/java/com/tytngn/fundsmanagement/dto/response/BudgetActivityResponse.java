package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetActivityResponse {
    String id;
    String name;
    LocalDate activityDate;
    double amount;
    int status;
    String unit;
    float quantity;
    String description;

    BudgetEstimateSimpleResponse budgetEstimate;
    PaymentReqSimpleResponse paymentReq;
}
