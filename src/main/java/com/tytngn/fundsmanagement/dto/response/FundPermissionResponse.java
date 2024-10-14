package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundPermissionResponse {
    String id;
    UserSimpleResponse user;
    FundSimpleResponse fund;
    boolean canContribute;
    boolean canWithdraw;
    LocalDate grantedDate;
}
