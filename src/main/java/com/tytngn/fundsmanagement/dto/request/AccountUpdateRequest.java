package com.tytngn.fundsmanagement.dto.request;

import com.tytngn.fundsmanagement.validator.DobConstraint;
import jakarta.persistence.Column;
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
public class AccountUpdateRequest {

    @NotBlank(message = "USERNAME_REQUIRED")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "USERNAME_INVALID")
    String username;

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
    String phone;

    @Column(unique = true)
    Long telegramId;

    @NotBlank(message = "BLANK_NAME")
    String bankName;

    @NotBlank(message = "DATA_INVALID")
    String accountNumber;
}
