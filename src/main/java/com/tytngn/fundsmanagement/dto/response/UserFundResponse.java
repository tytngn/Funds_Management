package com.tytngn.fundsmanagement.dto.response;

import com.tytngn.fundsmanagement.entity.UserFundId;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFundResponse {
    UserFundId id;
    int status;
}
