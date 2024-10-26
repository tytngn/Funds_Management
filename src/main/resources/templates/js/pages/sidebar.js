import * as utils from "/js/pages/services/utils.js";

$(document).ready(function () {
    // utils.loadScript("/plugins/bootstrap/js/bootstrap.bundle.min.js");
    $('[data-toggle="tooltip"]').tooltip();

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
    if (permissions.includes("GET_FUNDS_BY_FILTER")) {
        $('#fund').prop("hidden", false);// Hiện phần Quản lý quỹ
        $('#fund-management').prop("hidden", false); 
        $('#fund-permission').prop("hidden", false);
    }

    if (permissions.includes("GET_CONTRIBUTION_BY_FILTER")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#contribution').prop("hidden", false); // Hiện phần Đóng góp quỹ
    } 

    if (permissions.includes("GET_WITHDRAW_BY_FILTER")) {
        $('#transaction').prop("hidden", false); // Hiện phần Quản lý giao dịch
        $('#withdraw').prop("hidden", false); // Hiện phần Rút quỹ
    }

    if (permissions.includes("FILTER_PAYMENT_REQUEST")) {
        $('#payment').prop("hidden", false); // Hiện phần Quản lý thanh toán
        $('#payment-request').prop("hidden", false); // Hiện phần Đề nghị thanh toán
    }

    if (permissions.includes("GET_USERS_BY_FIFLTER")) {
        $('#account-management').prop("hidden", false); // Hiện phần Quản lý tài khoản
    }
}
