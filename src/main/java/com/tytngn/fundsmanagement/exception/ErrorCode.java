package com.tytngn.fundsmanagement.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // lỗi không xác định
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error.", HttpStatus.INTERNAL_SERVER_ERROR),
    // khoá message không hợp lệ
    KEY_INVALID(9990, "Invalid message key", HttpStatus.BAD_REQUEST),

    // người dùng đã tồn tại
    USER_EXISTS(1001, "User already exists.", HttpStatus.CONFLICT),
    // người dùng không tồn tại
    USER_NOT_EXISTS(1002, "User not found", HttpStatus.NOT_FOUND),

    // username là bắt buộc
    USERNAME_REQUIRED(1003, "Username is required.", HttpStatus.BAD_REQUEST),

    // mật khẩu là bắt buộc
    PASSWORD_REQUIRED(1004, "Password is required.", HttpStatus.BAD_REQUEST),
    // mật khẩu không hợp lệ
    PASSWORD_INVALID(1005, "Password must be at least 6 characters.", HttpStatus.BAD_REQUEST),

    // email là bắt buộc
    EMAIL_REQUIRED(1006, "Email is required.", HttpStatus.BAD_REQUEST),
    // email không hợp lệ
    EMAIL_INVALID(1007, "Email should be valid.", HttpStatus.BAD_REQUEST),

    // ngày sinh là bắt buộc
    DOB_REQUIRED(1008, "Date of birth is required.", HttpStatus.BAD_REQUEST),
    // ngày sinh không hợp lệ
    DOB_INVALID(1009, "Date of birth should be valid.", HttpStatus.BAD_REQUEST),

    // số điện thoại không hợp lệ
    PHONE_INVALID(1010, "Phone number must be exactly 10 digits.", HttpStatus.BAD_REQUEST),

    // yêu cầu không được xác thực, người dùng cần đăng nhập
    UNAUTHENTICATED(1011, "Unauthenticated error.", HttpStatus.UNAUTHORIZED),
    // người dùng không có quyền truy cập
    UNAUTHORIZED(1012, "You do not have permission", HttpStatus.FORBIDDEN),

    // chức năng đã tồn tại
    FUNCTIONS_EXISTS(1013, "Functions already exists.", HttpStatus.CONFLICT),
    // chức năng không tồn tại
    FUNCTIONS_NOT_EXISTS(1014, "Functions not found.", HttpStatus.NOT_FOUND),

    // tên bắt buộc
    BLANK_NAME(1015, "Name is required.", HttpStatus.BAD_REQUEST),

    // vai trò đã tồn tại
    ROLE_EXISTS(1016, "Role name already exists.", HttpStatus.CONFLICT),
    // vai trò không tồn tại
    ROLE_NOT_EXISTS(1017, "Role not found.", HttpStatus.NOT_FOUND),

    // quyền không tồn tại
    PERMISSION_NOT_EXISTS(1018, "Permission not exists.", HttpStatus.NOT_FOUND),

    // phòng ban đã tồn tại
    DEPARTMENT_EXISTS(1019, "Department already exists.", HttpStatus.CONFLICT),
    // phòng ban không tồn tại
    DEPARTMENT_NOT_EXISTS(1020, "Department not found.", HttpStatus.NOT_FOUND),

    // không hợp lệ
    DATA_INVALID(1021, "Data invalid request.", HttpStatus.BAD_REQUEST),

    // tài khoản ngân hàng đã tồn tại
    BANK_ACCOUNT_EXISTS(1022, "Bank account already exists.", HttpStatus.CONFLICT),
    // tài khoản ngân hàng không tồn tại
    BANK_ACCOUNT_NOT_EXISTS(1023, "Bank account not found.", HttpStatus.NOT_FOUND),
    // user đã có tài khoản ngân hàng
    USER_HAS_BANK_ACCOUNT(1024, "User has bank account.", HttpStatus.CONFLICT),

    // quỹ không tồn tại
    FUND_NOT_EXISTS(1025, "Fund not exists.", HttpStatus.NOT_FOUND),
    // quỹ đã tồn tại
    FUND_EXISTS(1026, "Fund already exists.", HttpStatus.CONFLICT),

    // loại giao dịch đã tồn tại
    TRANSACTION_TYPE_EXISTS(1027, "Transaction type already exists.", HttpStatus.CONFLICT),
    // loại giao dịch không tồn tại
    TRANSACTION_TYPE_NOT_EXISTS(1028, "Transaction type not found.", HttpStatus.NOT_FOUND),

    // giao dịch không tồn tại
    FUND_TRANSACTION_NOT_EXISTS(1029, "Fund transaction not found.", HttpStatus.NOT_FOUND),
    // giao dịch đã tồn tại
    FUND_TRANSACTION_EXISTS(1030, "Fund transaction already exists.", HttpStatus.CONFLICT),
    // giao dịch không đủ số dư
    INSUFFICIENT_FUNDS_TRANSACTION(1031, "Insufficient funds transaction.", HttpStatus.CONFLICT),

    // danh mục thanh toán đã tồn tại
    PAYMENT_CATEGORY_EXISTS(1032, "Payment category already exists.", HttpStatus.CONFLICT),
    // danh mục thanh toán không tồn tại
    PAYMENT_CATEGORY_NOT_EXISTS(1033, "Payment category not found.", HttpStatus.NOT_FOUND),
    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
