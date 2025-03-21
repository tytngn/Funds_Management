package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountResponse {
    String id;
    String bankName;
    String accountNumber;
    LocalDate createdDate;

    UserSimpleResponse user;
}
