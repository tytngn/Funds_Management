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
public class BudgetEstimateSimpleResponse {
    String id;
    int status;
    double amount;
    String title;
    String description;
    String fundName;
    LocalDate createdDate;
    LocalDate updatedDate;
}
