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
public class UserCreationRequest {

    @NotBlank(message = "USERNAME_REQUIRED")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "USERNAME_INVALID")
    String username;

    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    String email;

    @NotBlank(message = "BLANK_NAME")
    String fullname;

    int gender;

    @NotBlank(message = "DATA_INVALID")
    String departmentId;

    List<String> roleId;
}
