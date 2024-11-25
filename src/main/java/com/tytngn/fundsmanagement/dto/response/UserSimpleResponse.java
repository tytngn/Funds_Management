package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSimpleResponse {
    String id;
    String username;
    String email;
    String fullname;
    String phone;
    Long telegramId;
    DepartmentSimpleResponse department;
    BankAccountSimpleResponse account;
}
