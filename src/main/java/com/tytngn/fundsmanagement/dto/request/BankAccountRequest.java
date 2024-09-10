package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountRequest {
    @NotBlank(message = "BLANK_NAME")
    String bankName;

    @NotBlank(message = "INVALID")
    String accountNumber;

    @NotBlank(message = "BLANK_NAME")
    String accountName;

    LocalDate createdDate;

    String user;
}
