package com.tytngn.fundsmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFundRequest {

    String userId;
    String fundId;

    @NotNull(message = "DATA_INVALID")
    int status;
}
