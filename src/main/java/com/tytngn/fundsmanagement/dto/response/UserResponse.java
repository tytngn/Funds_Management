package com.tytngn.fundsmanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;
    String username;
    String email;
    String fullname;
    String phone;
    Long telegramId;
    LocalDate dob;
    int gender;
    int status;
    LocalDate createdDate;
    LocalDate updatedDate;

    Set<RoleResponse> roles;
    DepartmentSimpleResponse department;
    BankAccountSimpleResponse account;
}
