package com.tytngn.fundsmanagement.dto.request;

import com.tytngn.fundsmanagement.entity.Functions;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {
    String perm_name;
    String description;
    String functionsId;
}
