package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundPermissionRequest {

    List<String> userId;
    String fundId;

    @NotNull(message = "DATA_INVALID")
    boolean canContribute;

    @NotNull(message = "DATA_INVALID")
    boolean canWithdraw;

}
