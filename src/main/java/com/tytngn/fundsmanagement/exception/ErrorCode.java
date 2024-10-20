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
    KEY_INVALID(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    // tên bắt buộc
    BLANK_NAME(1002, "Name is required.", HttpStatus.BAD_REQUEST),
    // không hợp lệ
    DATA_INVALID(1003, "Data invalid request.", HttpStatus.BAD_REQUEST),

    // yêu cầu không được xác thực, người dùng cần đăng nhập
    UNAUTHENTICATED(1004, "Unauthenticated error.", HttpStatus.UNAUTHORIZED),
    // người dùng không có quyền truy cập
    UNAUTHORIZED(1005, "You do not have permission", HttpStatus.FORBIDDEN),

    // người dùng đã tồn tại
    USER_EXISTS(1006, "User already exists.", HttpStatus.CONFLICT),
    // người dùng không tồn tại
    USER_NOT_EXISTS(1007, "User not found", HttpStatus.NOT_FOUND),

    // username là bắt buộc
    USERNAME_REQUIRED(1008, "Username is required.", HttpStatus.BAD_REQUEST),
    // username không hợp lệ
    USERNAME_INVALID (1009, "Username is invalid.", HttpStatus.BAD_REQUEST),
    // mật khẩu là bắt buộc
    PASSWORD_REQUIRED(1010, "Password is required.", HttpStatus.BAD_REQUEST),
    // mật khẩu không hợp lệ
    PASSWORD_INVALID(1011, "Password must be at least 6 characters.", HttpStatus.BAD_REQUEST),

    // email là bắt buộc
    EMAIL_REQUIRED(1012, "Email is required.", HttpStatus.BAD_REQUEST),
    // email không hợp lệ
    EMAIL_INVALID(1013, "Email should be valid.", HttpStatus.BAD_REQUEST),

    // ngày sinh là bắt buộc
    DOB_REQUIRED(1014, "Date of birth is required.", HttpStatus.BAD_REQUEST),
    // ngày sinh không hợp lệ
    DOB_INVALID(1015, "Date of birth should be valid.", HttpStatus.BAD_REQUEST),

    // số điện thoại không hợp lệ
    PHONE_INVALID(1016, "Phone number must be exactly 10 digits.", HttpStatus.BAD_REQUEST),

    // chức năng đã tồn tại
    FUNCTIONS_EXISTS(1017, "Functions already exists.", HttpStatus.CONFLICT),
    // chức năng không tồn tại
    FUNCTIONS_NOT_EXISTS(1018, "Functions not found.", HttpStatus.NOT_FOUND),

    // vai trò đã tồn tại
    ROLE_EXISTS(1019, "Role name already exists.", HttpStatus.CONFLICT),
    // vai trò không tồn tại
    ROLE_NOT_EXISTS(1020, "Role not found.", HttpStatus.NOT_FOUND),

    // quyền không tồn tại
    PERMISSION_NOT_EXISTS(1021, "Permission not exists.", HttpStatus.NOT_FOUND),

    // phòng ban đã tồn tại
    DEPARTMENT_EXISTS(1022, "Department already exists.", HttpStatus.CONFLICT),
    // phòng ban không tồn tại
    DEPARTMENT_NOT_EXISTS(1023, "Department not found.", HttpStatus.NOT_FOUND),

    // tài khoản ngân hàng đã tồn tại
    BANK_ACCOUNT_EXISTS(1024, "Bank account already exists.", HttpStatus.CONFLICT),
    // tài khoản ngân hàng không tồn tại
    BANK_ACCOUNT_NOT_EXISTS(1025, "Bank account not found.", HttpStatus.NOT_FOUND),
    // user đã có tài khoản ngân hàng
    USER_HAS_BANK_ACCOUNT(1026, "User has bank account.", HttpStatus.CONFLICT),

    // loại giao dịch đã tồn tại
    TRANSACTION_TYPE_EXISTS(1027, "Transaction type already exists.", HttpStatus.CONFLICT),
    // loại giao dịch không tồn tại
    TRANSACTION_TYPE_NOT_EXISTS(1028, "Transaction type not found.", HttpStatus.NOT_FOUND),

    // quỹ không tồn tại
    FUND_NOT_EXISTS(1029, "Fund not exists.", HttpStatus.NOT_FOUND),
    // quỹ đã tồn tại
    FUND_EXISTS(1030, "Fund already exists.", HttpStatus.CONFLICT),
    // quỹ ngưng hoạt động
    INACTIVE_FUND (1031, "Inactive fund.", HttpStatus.GONE),

    // Phân quyền giao dịch quỹ cho người dùng đã tồn tại
    FUND_PERMISSION_EXISTS(1032, "Permission already exists for user", HttpStatus.CONFLICT),
    // Phân quyền giao dịch quỹ cho người dùng không tồn tại
    FUND_PERMISSION_NOT_EXISTS(1033, "No permission found for user", HttpStatus.NOT_FOUND),
    // Không có quyền đóng góp quỹ
    NO_CONTRIBUTION_PERMISSION (1034, "No contribution permission found for user", HttpStatus.NOT_FOUND),
    // Không có quyền rút quỹ
    NO_WITHDRAW_PERMISSION (1035, "No withdraw permission found for user", HttpStatus.NOT_FOUND),

    // giao dịch không tồn tại
    FUND_TRANSACTION_NOT_EXISTS(1036, "Fund transaction not found.", HttpStatus.NOT_FOUND),
    // giao dịch đã tồn tại
    FUND_TRANSACTION_EXISTS(1037, "Fund transaction already exists.", HttpStatus.CONFLICT),
    // giao dịch không đủ số dư
    INSUFFICIENT_FUNDS_TRANSACTION(1038, "Insufficient funds transaction.", HttpStatus.CONFLICT),
    // giao dịch đã được xử lý
    TRANSACTION_ALREADY_PROCESSED(1039, "Transaction already processed.", HttpStatus.CONFLICT),

    // danh mục thanh toán đã tồn tại
    PAYMENT_CATEGORY_EXISTS(1040, "Payment category already exists.", HttpStatus.CONFLICT),
    // danh mục thanh toán không tồn tại
    PAYMENT_CATEGORY_NOT_EXISTS(1041, "Payment category not found.", HttpStatus.NOT_FOUND),

    // đề nghị thanh toán không tồn tại
    PAYMENT_REQUEST_NOT_EXISTS(1042, "Payment request not found.", HttpStatus.NOT_FOUND),
    // đề nghị thanh toán đã tồn tại
    PAYMENT_REQUEST_EXISTS(1043, "Payment request already exists.", HttpStatus.CONFLICT),
    // đề nghị thanh toán đã được gửi, không thể chỉnh sửa
    PAYMENT_REQUEST_NOT_EDITABLE(1044, "Payment request is not editable", HttpStatus.FORBIDDEN),
    // đề nghị thanh toán không thể xoá
    PAYMENT_REQUEST_HAS_INVOICES(1045, "Cannot delete this payment request because it has related invoices.", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể xoá
    PAYMENT_REQUEST_HAS_BUDGET_ACTIVITY(1046, "Cannot delete this payment request because it has related budget activity.", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể gửi
    PAYMENT_REQUEST_NOT_SENDABLE (1047, "Payment request is not sendable", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể xác nhận
    PAYMENT_REQUEST_NOT_CONFIRMABLE(1048, "Payment request is not confirmable", HttpStatus.CONFLICT),

    // hoá đơn không tồn tại
    INVOICE_NOT_EXISTS(1049, "Invoice not exists.", HttpStatus.NOT_FOUND),
    // hoá đơn đã tồn tại
    INVOICE_EXISTS(1050, "Invoice already exists.", HttpStatus.CONFLICT),
    // hoá đơn không thể xoá
    INVOICE_CANNOT_BE_DELETED(1051, "Invoice cannot be deleted.", HttpStatus.CONFLICT),

    // dự trù ngân sách không tồn tại
    BUDGET_ESTIMATE_NOT_EXISTS(1052, "Budget estimate not exists.", HttpStatus.NOT_FOUND),
    // dự trù ngân sách đã được gửi, không thể chỉnh sửa
    BUDGET_ESTIMATE_NOT_EDITABLE(1053, "Budget estimate is not editable.", HttpStatus.CONFLICT),

    // hoạt động dự trù không tồn tại
    BUDGET_ACTIVITY_NOT_EXISTS(1054, "Budget activity not exists.", HttpStatus.NOT_FOUND),
    // hoạt động dự trù không thể xoá
    BUDGET_ACTIVITY_CANNOT_BE_DELETE(1055, "Budget activity cannot be deleted.", HttpStatus.CONFLICT),
    // hoạt động dự trù cuối cùng không thể xoá
    LAST_BUDGET_ACTIVITY_CANNOT_BE_DELETE(1056, "Cannot delete the last budget activity from the budget estimate.", HttpStatus.CONFLICT),

    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
