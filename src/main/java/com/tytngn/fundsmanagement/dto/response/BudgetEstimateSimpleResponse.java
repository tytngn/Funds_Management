package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetEstimateSimpleResponse {
    String id;
    int status;
    String title;
    String description;
    String fundName;
    LocalDateTime createdDate;
    LocalDateTime updatedDate;
}
