package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountRequest {
    @NotBlank(message = "BLANK_NAME")
    String bankName;

    @NotBlank(message = "DATA_INVALID")
    String accountNumber;
}
