package com.tytngn.fundsmanagement.constant;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PUBLIC, makeFinal = true)
public class PredefinedRole {
    String USER_ROLE = "USER";
    String ADMIN_ROLE = "ADMIN";

    private PredefinedRole() {}
}
