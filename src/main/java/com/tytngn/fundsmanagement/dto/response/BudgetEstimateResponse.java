package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetEstimateResponse {
    String id;
    int status;
    double amount;
    String title;
    String description;
    String fundName;
    LocalDate createdDate;
    LocalDate updatedDate;

    UserSimpleResponse user;
}
