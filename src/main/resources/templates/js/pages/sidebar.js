import * as utils from "/js/pages/services/utils.js";

$(document).ready(function () {

    if (utils.getCookie("authToken") !== null) {
        var userInfo = utils.getLocalStorageObject("userInfo");
        if (userInfo == null) {
            $.ajax({
                type: "GET",
                url: "/api/users/my-info",
                headers: utils.defaultHeaders(),
                dataType: "json",
                success: function (res) {
                    if(res.code == 1000){
                        utils.setLocalStorageObject('userInfo', res.result)

                        updateSidebarVisibility(res.result.roles);
                    }
                },
                error: function (xhr, status, error) {
                    console.log("Error in getting user's info");
                },
            });
        } else {
            updateSidebarVisibility(userInfo.roles);
        }
    }
});


// Hàm cập nhật hiển thị sidebar dựa trên role
function updateSidebarVisibility(roles) {
    let permissions = [];
    roles.forEach(role => {
        role.permissions.forEach(permission => {
            permissions.push(permission.id);
        });
    });

    // Kiểm tra và ẩn/hiện từng mục trong sidebar dựa trên các permission
    if (permissions.includes("GET_FUNDS_BY_FILTER") || permissions.includes("FILTER_FUNDS_BY_TREASURER")) {
        $('#fund').prop("hidden", false);// Hiện phần Quản lý quỹ
        $('#fund-management').prop("hidden", false); // Quản lý quỹ
    }

    if (permissions.includes("FILTER_FUND_PERMISSIONS_BY_TREASURER")) {
        $('#fund').prop("hidden", false);// Hiện phần Quản lý quỹ
        $('#fund-permission').prop("hidden", false); // Phân quyền giao dịch
    }

    if (permissions.includes("GET_CONTRIBUTION_BY_FILTER") || permissions.includes("FILTER_CONTRIBUTION_BY_TREASURER")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#contribution-management').prop("hidden", false); // Hiện phần Quản lý đóng góp
    } 

    if (permissions.includes("GET_FUNDS_USER_CAN_CONTRIBUTE")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#contribution').prop("hidden", false); // Hiện phần Đóng góp quỹ
    } 

    if (permissions.includes("GET_WITHDRAW_BY_FILTER")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#withdrawal-management').prop("hidden", false); // Hiện phần Quản lý rút quỹ
    }

    if (permissions.includes("GET_USER_WITHDRAWALS_BY_FILTER")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#withdrawal').prop("hidden", false); // Hiện phần Rút quỹ
    }

    if (permissions.includes("FILTER_PAYMENT_REQUEST") || permissions.includes("FILTER_PAYMENT_REQUESTS_BY_TREASURER")) {
        $('#payment').prop("hidden", false); // Hiện phần Quản lý thanh toán
        $('#payment-management').prop("hidden", false); // Hiện phần Quản lý thanh toán  
    }

    if (permissions.includes("GET_USER_PAYMENT_REQUESTS_BY_FILTER")) {
        $('#payment').prop("hidden", false); // Hiện phần Quản lý thanh toán       
        $('#payment-request').prop("hidden", false); // Hiện phần Đề nghị thanh toán
    }

    if (permissions.includes("GET_USERS_BY_FIFLTER")) {
        $('#account-management').prop("hidden", false); // Hiện phần Quản lý tài khoản
    }

    if (permissions.includes("CREATE_DEPARTMENT")) {
        $('#category').prop("hidden", false); // Hiện phần Quản lý danh mục
        $('#department').prop("hidden", false); // Hiện phần Danh mục phòng ban
    }

    if (permissions.includes("CREATE_TRANSACTION_TYPE")) {
        $('#category').prop("hidden", false); // Hiện phần Quản lý danh mục
        $('#transaction-type').prop("hidden", false); // Hiện phần Loại giao dịch
    }
}

