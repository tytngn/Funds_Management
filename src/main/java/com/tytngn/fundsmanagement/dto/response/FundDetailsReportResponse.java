package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundDetailsReportResponse {
    String fundName;
    String description;
    double totalContribution;
    double totalWithdrawal;
    double totalPayment;
    double totalBalance;
    List<DepartmentDetailResponse> department;
}
