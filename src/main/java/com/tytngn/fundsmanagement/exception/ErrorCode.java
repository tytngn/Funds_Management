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
    // không thể chỉnh sửa admin
    ADMIN_NOT_EDITABLE(1008, "Cannot edit admin account", HttpStatus.FORBIDDEN),

    // username là bắt buộc
    USERNAME_REQUIRED(1009, "Username is required.", HttpStatus.BAD_REQUEST),
    // username không hợp lệ
    USERNAME_INVALID (1010, "Username is invalid.", HttpStatus.BAD_REQUEST),
    // mật khẩu là bắt buộc
    PASSWORD_REQUIRED(1011, "Password is required.", HttpStatus.BAD_REQUEST),
    // mật khẩu không hợp lệ
    PASSWORD_INVALID(1012, "Password must be at least 6 characters.", HttpStatus.BAD_REQUEST),
    // mật khẩu hiện tại không đúng
    CURRENT_PASSWORD_INCORRECT(1013, "Current password is incorrect.", HttpStatus.BAD_REQUEST),
    // mật khẩu mới phải khác mật khẩu hiện tại
    NEW_PASSWORD_MUST_BE_DIFFERENT(1014, "New password must be different.", HttpStatus.BAD_REQUEST),

    // email là bắt buộc
    EMAIL_REQUIRED(1015, "Email is required.", HttpStatus.BAD_REQUEST),
    // email không hợp lệ
    EMAIL_INVALID(1016, "Email should be valid.", HttpStatus.BAD_REQUEST),
    // email đã tồn tại
    EMAIL_EXISTS (1017, "Email already exists.", HttpStatus.CONFLICT),

    // ngày sinh là bắt buộc
    DOB_REQUIRED(1017, "Date of birth is required.", HttpStatus.BAD_REQUEST),
    // ngày sinh không hợp lệ
    DOB_INVALID(1018, "Date of birth should be valid.", HttpStatus.BAD_REQUEST),

    // số điện thoại không hợp lệ
    PHONE_INVALID(1019, "Phone number must be exactly 10 digits.", HttpStatus.BAD_REQUEST),

    // chức năng đã tồn tại
    FUNCTIONS_EXISTS(1020, "Functions already exists.", HttpStatus.CONFLICT),
    // chức năng không tồn tại
    FUNCTIONS_NOT_EXISTS(1021, "Functions not found.", HttpStatus.NOT_FOUND),

    // vai trò đã tồn tại
    ROLE_EXISTS(1022, "Role name already exists.", HttpStatus.CONFLICT),
    // vai trò không tồn tại
    ROLE_NOT_EXISTS(1023, "Role not found.", HttpStatus.NOT_FOUND),

    // quyền không tồn tại
    PERMISSION_NOT_EXISTS(1024, "Permission not exists.", HttpStatus.NOT_FOUND),

    // phòng ban đã tồn tại
    DEPARTMENT_EXISTS(1025, "Department already exists.", HttpStatus.CONFLICT),
    // phòng ban không tồn tại
    DEPARTMENT_NOT_EXISTS(1026, "Department not found.", HttpStatus.NOT_FOUND),

    // tài khoản ngân hàng đã tồn tại
    BANK_ACCOUNT_EXISTS(1027, "Bank account already exists.", HttpStatus.CONFLICT),
    // tài khoản ngân hàng không tồn tại
    BANK_ACCOUNT_NOT_EXISTS(1028, "Bank account not found.", HttpStatus.NOT_FOUND),
    // user đã có tài khoản ngân hàng
    USER_HAS_BANK_ACCOUNT(1029, "User has bank account.", HttpStatus.CONFLICT),

    // loại giao dịch đã tồn tại
    TRANSACTION_TYPE_EXISTS(1030, "Transaction type already exists.", HttpStatus.CONFLICT),
    // loại giao dịch không tồn tại
    TRANSACTION_TYPE_NOT_EXISTS(1031, "Transaction type not found.", HttpStatus.NOT_FOUND),

    // quỹ không tồn tại
    FUND_NOT_EXISTS(1032, "Fund not exists.", HttpStatus.NOT_FOUND),
    // quỹ đã tồn tại
    FUND_EXISTS(1033, "Fund already exists.", HttpStatus.CONFLICT),
    // quỹ ngưng hoạt động
    INACTIVE_FUND (1034, "Inactive fund.", HttpStatus.GONE),

    // Phân quyền giao dịch quỹ cho người dùng đã tồn tại
    FUND_PERMISSION_EXISTS(1035, "Permission already exists for user", HttpStatus.CONFLICT),
    // Phân quyền giao dịch quỹ cho người dùng không tồn tại
    FUND_PERMISSION_NOT_EXISTS(1036, "No permission found for user", HttpStatus.NOT_FOUND),
    // Không có quyền đóng góp quỹ
    NO_CONTRIBUTION_PERMISSION (1037, "No contribution permission found for user", HttpStatus.NOT_FOUND),
    // Không có quyền rút quỹ
    NO_WITHDRAW_PERMISSION (1038, "No withdraw permission found for user", HttpStatus.NOT_FOUND),

    // giao dịch không tồn tại
    FUND_TRANSACTION_NOT_EXISTS(1039, "Fund transaction not found.", HttpStatus.NOT_FOUND),
    // giao dịch đã tồn tại
    FUND_TRANSACTION_EXISTS(1040, "Fund transaction already exists.", HttpStatus.CONFLICT),
    // giao dịch không đủ số dư
    INSUFFICIENT_FUNDS_TRANSACTION(1041, "Insufficient funds transaction.", HttpStatus.CONFLICT),
    // giao dịch đã được xử lý
    TRANSACTION_ALREADY_PROCESSED(1042, "Transaction already processed.", HttpStatus.CONFLICT),

    // danh mục thanh toán đã tồn tại
    PAYMENT_CATEGORY_EXISTS(1043, "Payment category already exists.", HttpStatus.CONFLICT),
    // danh mục thanh toán không tồn tại
    PAYMENT_CATEGORY_NOT_EXISTS(1044, "Payment category not found.", HttpStatus.NOT_FOUND),

    // đề nghị thanh toán không tồn tại
    PAYMENT_REQUEST_NOT_EXISTS(1045, "Payment request not found.", HttpStatus.NOT_FOUND),
    // đề nghị thanh toán đã tồn tại
    PAYMENT_REQUEST_EXISTS(1046, "Payment request already exists.", HttpStatus.CONFLICT),
    // đề nghị thanh toán đã được gửi, không thể chỉnh sửa
    PAYMENT_REQUEST_NOT_EDITABLE(1047, "Payment request is not editable", HttpStatus.FORBIDDEN),
    // đề nghị thanh toán không thể xoá
    PAYMENT_REQUEST_HAS_INVOICES(1048, "Cannot delete this payment request because it has related invoices.", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể xoá
    PAYMENT_REQUEST_HAS_BUDGET_ACTIVITY(1049, "Cannot delete this payment request because it has related budget activity.", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể gửi
    PAYMENT_REQUEST_NOT_SENDABLE (1050, "Payment request is not sendable", HttpStatus.FORBIDDEN),
    // Số tiền đề nghị thanh toán không được bằng 0
    PAYMENT_REQUEST_AMOUNT_ZERO(1051, "The amount of the payment request cannot be zero", HttpStatus.BAD_REQUEST),
    // Đã vượt quá giới hạn gửi đề nghị thanh toán. Bạn chỉ có thể gửi tối đa 3 lần
    PAYMENT_REQUEST_SEND_LIMIT_EXCEEDED (1052, "Send limit exceeded for the payment request. You can only send a maximum of 3 times", HttpStatus.TOO_MANY_REQUESTS),
    // đề nghị thanh toán không thể xác nhận
    PAYMENT_REQUEST_NOT_CONFIRMABLE(1051, "Payment request is not confirmable", HttpStatus.CONFLICT),
    // đề nghị thanh toán không thể thanh toán
    PAYMENT_REQUEST_NOT_PAYABLE(1052, "Payment request is not payable", HttpStatus.CONFLICT),
    // Đề nghị thanh toán chưa được thanh toán, không thể chuyển sang trạng thái đã nhận
    PAYMENT_REQUEST_NOT_RECEIVABLE(1053, "The payment request has not been paid and cannot be marked as received", HttpStatus.CONFLICT),

    // hoá đơn không tồn tại
    INVOICE_NOT_EXISTS(1052, "Invoice not exists.", HttpStatus.NOT_FOUND),
    // hoá đơn đã tồn tại
    INVOICE_EXISTS(1053, "Invoice already exists.", HttpStatus.CONFLICT),
    // hoá đơn không thể xoá
    INVOICE_CANNOT_BE_DELETED(1054, "Invoice cannot be deleted.", HttpStatus.CONFLICT),

    // dự trù ngân sách không tồn tại
    BUDGET_ESTIMATE_NOT_EXISTS(1055, "Budget estimate not exists.", HttpStatus.NOT_FOUND),
    // dự trù ngân sách đã được gửi, không thể chỉnh sửa
    BUDGET_ESTIMATE_NOT_EDITABLE(1056, "Budget estimate is not editable.", HttpStatus.CONFLICT),

    // hoạt động dự trù không tồn tại
    BUDGET_ACTIVITY_NOT_EXISTS(1057, "Budget activity not exists.", HttpStatus.NOT_FOUND),
    // hoạt động dự trù không thể xoá
    BUDGET_ACTIVITY_CANNOT_BE_DELETE(1058, "Budget activity cannot be deleted.", HttpStatus.CONFLICT),
    // hoạt động dự trù cuối cùng không thể xoá
    LAST_BUDGET_ACTIVITY_CANNOT_BE_DELETE(1059, "Cannot delete the last budget activity from the budget estimate.", HttpStatus.CONFLICT),

    ;

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
