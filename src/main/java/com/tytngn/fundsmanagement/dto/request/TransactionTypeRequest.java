package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionTypeRequest {
    @NotBlank(message = "BLANK_NAME")
    String name;

    @NotNull(message = "DATA_INVALID")
    int status;
}
