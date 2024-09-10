package com.tytngn.fundsmanagement.dto.request;

import com.tytngn.fundsmanagement.entity.Functions;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {

    String id;

    @NotBlank(message = "DATA_INVALID")
    String perm_name;

    String functionsId;
}
