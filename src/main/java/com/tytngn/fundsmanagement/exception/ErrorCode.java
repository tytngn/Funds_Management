package com.tytngn.fundsmanagement.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error."),
    KEY_INVALID(9990, "Invalid message key"),

    USER_EXISTS(1001, "User already exists."),
    USER_NOT_EXISTS(1011, "User not found"),

    USERNAME_REQUIRED(1002, "Username is required."),

    PASSWORD_REQUIRED(1003, "Password is required."),
    PASSWORD_INVALID(1004, "Password must be at least 6 characters."),

    EMAIL_REQUIRED(1005, "Email is required."),
    EMAIL_INVALID(1006, "Email should be valid."),

    FULL_NAME_REQUIRED(1007, "Full name is required."),

    DOB_REQUIRED(1008, "Date of birth is required."),
    DOB_INVALID(1009, "Date of birth should be valid."),

    PHONE_INVALID(1010, "Phone number must be exactly 10 digits."),

    UNAUTHENTICATED(1012, "Unauthenticated error."),

    FUNCTIONS_EXISTS(1013, "Functions already exists."),
    FUNCTIONS_NOT_EXISTS(1014, "Functions not found."),

    BLANK_NAME(1015, "Name is required."),
    ;

    private int code;
    private String message;
}
