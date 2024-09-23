package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundResponse {
    String id;
    String fundName;
    double balance;
    int status;
    String description;
    LocalDate createDate;
    LocalDate updateDate;

    // người quản lý
    UserSimpleResponse user;
}
