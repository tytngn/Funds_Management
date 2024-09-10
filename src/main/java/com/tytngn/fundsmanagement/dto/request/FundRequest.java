package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundRequest {

    @NotBlank(message = "DATA_INVALID")
    String fundName;

    @NotNull(message = "DATA_INVALID")
    @PositiveOrZero(message = "DATA_INVALID")
    double balance = 0.0;

    @NotNull(message = "DATA_INVALID")
    int status = 1;

    String description;
    LocalDate createDate;

    String user;
}
