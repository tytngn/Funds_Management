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
public class FundRequest {

    @NotBlank(message = "DATA_INVALID")
    String fundName;

    @NotNull(message = "DATA_INVALID")
    int status = 1;

    String description;
}
