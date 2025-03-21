package com.tytngn.fundsmanagement.dto.request;

import com.tytngn.fundsmanagement.validator.DobConstraint;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    @NotBlank(message = "USERNAME_REQUIRED")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "USERNAME_INVALID")
    String username;

//    @NotBlank(message = "PASSWORD_REQUIRED")
//    @Size(min = 6, message = "PASSWORD_INVALID")
//    String password;

    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "BLANK_NAME")
    String fullname;

    @NotNull(message = "DOB_REQUIRED")
    @Past(message = "DOB_INVALID")
    @DobConstraint(min = 18, message = "DOB_INVALID")
    LocalDate dob;

    int gender;

//    @Pattern(regexp = "\\d{10}", message = "PHONE_INVALID")
    String phone;

    int status = 1;

    @NotBlank(message = "DATA_INVALID")
    String departmentId;

    List<String> roleId;
}
