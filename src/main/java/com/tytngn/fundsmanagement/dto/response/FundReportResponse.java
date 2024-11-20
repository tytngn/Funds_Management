package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundReportResponse {
    String fundName;
    double income;
    double expense;
    int contributorsCount;
    int status;
    double beginningBalance;
    double remainingBalance;
}
