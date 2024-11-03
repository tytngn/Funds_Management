package com.tytngn.fundsmanagement.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FundPermissionRequest {

    List<String> userId;
    String fundId;

    boolean canContribute;

    boolean canWithdraw;

}
