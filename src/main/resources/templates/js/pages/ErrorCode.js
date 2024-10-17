const ErrorCode = {
    UNCATEGORIZED_EXCEPTION: { code: 9999, message: "Lỗi không xác định", statusCode: 500 },
    KEY_INVALID: { code: 1001, message: "MESSAGE_KEY không xác định", statusCode: 400 },
    BLANK_NAME: { code: 1002, message: "Tên không được để trống", statusCode: 400 },
    DATA_INVALID: { code: 1003, message: "Dữ liệu không hợp lệ", statusCode: 400 },

    UNAUTHENTICATED: { code: 1004, message: "Không thể xác thực, vui lòng đăng nhập lại", statusCode: 401 },
    UNAUTHORIZED: { code: 1005, message: "Bạn không có quyền truy cập", statusCode: 403 },

    USER_EXISTS: { code: 1006, message: "Người dùng đã tồn tại", statusCode: 409 },
    USER_NOT_EXISTS: { code: 1007, message: "Người dùng không tồn tại", statusCode: 404 },

    USERNAME_REQUIRED: { code: 1008, message: "Username không được để trống", statusCode: 400 },
    PASSWORD_REQUIRED: { code: 1009, message: "Mật khẩu không được để trống", statusCode: 400 },
    PASSWORD_INVALID: { code: 1010, message: "Mật khẩu phải có ít nhất 6 ký tự", statusCode: 400 },

    EMAIL_REQUIRED: { code: 1011, message: "Email không được để trống", statusCode: 400 },
    EMAIL_INVALID: { code: 1012, message: "Email không hợp lệ", statusCode: 400 },

    DOB_REQUIRED: { code: 1013, message: "Ngày sinh không được để trống", statusCode: 400 },
    DOB_INVALID: { code: 1014, message: "Ngày sinh không hợp lệ", statusCode: 400 },

    PHONE_INVALID: { code: 1015, message: "Số điện thoại không hợp lệ", statusCode: 400 },

    FUNCTIONS_EXISTS: { code: 1016, message: "Chức năng đã tồn tại", statusCode: 409 },
    FUNCTIONS_NOT_EXISTS: { code: 1017, message: "Chức năng không tồn tại", statusCode: 404 },

    ROLE_EXISTS: { code: 1018, message: "Vai trò đã tồn tại", statusCode: 409 },
    ROLE_NOT_EXISTS: { code: 1019, message: "Vai trò không tồn tại", statusCode: 404 },

    PERMISSION_NOT_EXISTS: { code: 1020, message: "Phân quyền không tồn tại", statusCode: 404 },

    DEPARTMENT_EXISTS: { code: 1021, message: "Phòng ban đã tồn tại", statusCode: 409 },
    DEPARTMENT_NOT_EXISTS: { code: 1022, message: "Phòng ban không tồn tại", statusCode: 404 },

    BANK_ACCOUNT_EXISTS: { code: 1023, message: "Tài khoản ngân hàng đã tồn tại", statusCode: 409 },
    BANK_ACCOUNT_NOT_EXISTS: { code: 1024, message: "Tài khoản ngân hàng không tồn tại", statusCode: 404 },
    USER_HAS_BANK_ACCOUNT: { code: 1025, message: "Người dùng đã có tài khoản ngân hàng", statusCode: 409 },

    TRANSACTION_TYPE_EXISTS: { code: 1026, message: "Loại giao dịch đã tồn tại", statusCode: 409 },
    TRANSACTION_TYPE_NOT_EXISTS: { code: 1027, message: "Loại giao dịch không tồn tại", statusCode: 404 },

    FUND_NOT_EXISTS: { code: 1028, message: "Quỹ không tồn tại", statusCode: 404 },
    FUND_EXISTS: { code: 1029, message: "Quỹ đã tồn tại", statusCode: 409 },
    INACTIVE_FUND: { code: 1030, message: "Quỹ ngưng hoạt động", statusCode: 410 },

    FUND_PERMISSION_EXISTS: { code: 1031, message: "Phân quyền giao dịch quỹ cho người dùng đã tồn tại", statusCode: 409 },
    FUND_PERMISSION_NOT_EXISTS: { code: 1032, message: "Không tìm thấy quyền cho người dùng", statusCode: 404 },
    NO_CONTRIBUTION_PERMISSION: {code: 1033, message: "Người dùng không có quyền đóng góp quỹ", statusCode: 404 },
    NO_WITHDRAW_PERMISSION: { code: 1034, message: "Người dùng không có quyền rút quỹ",statusCode: 404 },

    FUND_TRANSACTION_NOT_EXISTS: { code: 1035, message: "Giao dịch không tồn tại", statusCode: 404 },
    FUND_TRANSACTION_EXISTS: { code: 1036, message: "Giao dịch đã tồn tại", statusCode: 409 },
    INSUFFICIENT_FUNDS_TRANSACTION: { code: 1037, message: "Giao dịch không đủ số dư", statusCode: 409 },
    TRANSACTION_ALREADY_PROCESSED: { code: 1038, message: "Giao dịch đã được xử lý", statusCode: 409 },

    PAYMENT_CATEGORY_EXISTS: { code: 1039, message: "Danh mục thanh toán đã tồn tại", statusCode: 409 },
    PAYMENT_CATEGORY_NOT_EXISTS: { code: 1040, message: "Danh mục thanh toán không tồn tại", statusCode: 404 },

    PAYMENT_REQUEST_NOT_EXISTS: { code: 1041, message: "Đề nghị thanh toán không tồn tại", statusCode: 404 },
    PAYMENT_REQUEST_EXISTS: { code: 1042, message: "Đề nghị thanh toán đã tồn tại", statusCode: 409 },
    PAYMENT_REQUEST_NOT_EDITABLE: { code: 1043, message: "Đề nghị thanh toán không thể chỉnh sửa", statusCode: 403 },
    PAYMENT_REQUEST_HAS_INVOICES: { code: 1044, message: "Không thể xoá đề nghị thanh toán vì tồn tại hoá đơn", statusCode: 409 },
    PAYMENT_REQUEST_HAS_BUDGET_ACTIVITY: { code: 1045, message: "Không thể xoá đề nghị thanh toán vì tồn tại hoạt động dự trù", statusCode: 409 },
    PAYMENT_REQUEST_NOT_SENDABLE: { code: 1046, message: "Đề nghị thanh toán không thể gửi", statusCode: 409 },
    PAYMENT_REQUEST_NOT_CONFIRMABLE: { code: 1047, message: "Đề nghị thanh toán không thể xác nhận", statusCode: 409 },

    INVOICE_NOT_EXISTS: { code: 1048, message: "Hoá đơn không tồn tại", statusCode: 404 },
    INVOICE_EXISTS: { code: 1049, message: "Hoá đơn đã tồn tại", statusCode: 409 },
    INVOICE_CANNOT_BE_DELETED: { code: 1050, message: "Hoá đơn không thể xoá", statusCode: 409 },

    BUDGET_ESTIMATE_NOT_EXISTS: { code: 1051, message: "Dự trù ngân sách không tồn tại", statusCode: 404 },
    BUDGET_ESTIMATE_NOT_EDITABLE: { code: 1052, message: "Dự trù ngân sách không thể chỉnh sửa", statusCode: 409 },

    BUDGET_ACTIVITY_NOT_EXISTS: { code: 1053, message: "Hoạt động dự trù không tồn tại", statusCode: 404 },
    BUDGET_ACTIVITY_CANNOT_BE_DELETE: { code: 1054, message: "Hoạt động dự trù không thể xoá", statusCode: 409 },
    LAST_BUDGET_ACTIVITY_CANNOT_BE_DELETE: { code: 1055, message: "Không thể xoá hoạt động dự trù cuối cùng của dự trù ngân sách", statusCode: 409 }

}

export default ErrorCode;