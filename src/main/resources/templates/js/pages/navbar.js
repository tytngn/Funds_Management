import * as utils from "/js/pages/services/utils.js";

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

$(document).ready(function(){
    if (utils.getCookie("authToken") !== null) {
        var userInfo = utils.getLocalStorageObject("userInfo");
        if (userInfo == null) {
            $.ajax({
                type: "GET",
                url: "/api/users/my-info",
                headers: utils.defaultHeaders(),
                dataType: "json",
                success: function (res) {
                    if (res.code == 1000) {
                        utils.setLocalStorageObject('userInfo', res.result);
                        updateBreadcrumb(res.result.roles); // Cập nhật breadcrumb
                    }
                },
                error: function () {
                    console.log("Error in getting user's info");
                },
            });
        } else {
            updateBreadcrumb(userInfo.roles); // Cập nhật breadcrumb
        }
    }
    
    // Hiển thị tên người dùng đang đăng nhập
    loadName(); 


    // Đổi mật khẩu
    utils.checkLoginStatus().then(isValid => {
        if(isValid) {
            $("#change-password").on("click", function () { 
                utils.clear_modal();
  
                $("#modal-title").text("Đổi mật khẩu");

                $("#modal-body").append(`

                    <div class="form-group">
                        <label for="current-password">Mật khẩu hiện tại</label>
                        <input type="password" class="form-control form-control-lg" id="current-password" placeholder="Nhập mật khẩu hiện tại">
                    </div>

                    <div class="form-group">
                        <label for="new-password">Mật khẩu mới</label>
                        <input type="password" class="form-control form-control-lg" id="new-password" placeholder="Nhập mật khẩu mới">
                        <p class="card-description" style="color: #76838f;">Mật khẩu phải ít nhất 6 kí tự</p>
                    </div>
                  
                    <div class="form-group">
                        <label for="confirm-password">Xác nhận mật khẩu mới</label>
                        <input type="password" class="form-control form-control-lg" id="confirm-password" placeholder="Nhập lại mật khẩu mới">
                    </div>
                `);

                $("#modal-footer").append(`
                    <button type="submit" class="btn btn-primary mr-2" id="modal-submit-btn">
                        <i class="fa-regular fa-floppy-disk mr-2"></i>Lưu
                    </button>
                    <button class="btn btn-light" id="modal-cancel-btn">
                        <i class="fa-regular fa-circle-xmark mr-2"></i>Huỷ bỏ
                    </button>
                `);

                $("#modal-id").modal("show");

                // Lưu thông tin quỹ
                $("#modal-submit-btn").click(function () {
                    let currentPassword = $("#current-password").val();
                    let newPassword = $("#new-password").val();
                    let confirmPassword = $("#confirm-password").val();

                    if (currentPassword == null || currentPassword.trim()==""){
                        Toast.fire({
                            icon: "error",
                            title: "Vui lòng nhập mật khẩu hiện tại!"
                        });
                        return;
                    } 
                    else if (newPassword !== confirmPassword){
                        Toast.fire({
                            icon: "error",
                            title: "Mật khẩu mới không trùng khớp!"
                        });
                        return;
                    }
                    else if (currentPassword === newPassword){
                        Toast.fire({
                            icon: "error",
                            title: "Mật khẩu mới phải khác mật khẩu hiện tại!"
                        });
                        return;
                    }
                    else {
                        $.ajax({
                            type: "PUT",
                            url: "/api/users/change-password",
                            headers: utils.defaultHeaders(),
                            data: JSON.stringify({
                                currentPassword: currentPassword,
                                newPassword: newPassword
                            }),
                            beforeSend: function () {
                                Swal.showLoading();
                            },
                            success: function (res) {
                                Swal.close();
                                if(res.code==1000){
                                    Toast.fire({
                                        icon: "success",
                                        title: "Đã đổi mật khẩu thành công!",
                                        timer: 3000,
                                    });
                                    $("#modal-id").modal("hide");
                                }
                                else {
                                    Toast.fire({
                                        icon: "error",
                                        title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                                    });
                                }
                            }, 
                            error: function(xhr, status, error){
                                Swal.close();
                                var err = utils.handleAjaxError(xhr);
                                Toast.fire({
                                    icon: "error",
                                    title: err.message
                                });
                            },
                        });
                    }
                });

                // Khi nhấn nút "Huỷ bỏ"
                $("#modal-cancel-btn").click(function (){
                    // Đóng modal
                    $("#modal-id").modal('hide');
                });
            });
        }
    });

    // Đăng xuất
    utils.checkLoginStatus().then(isValid => {
        if (isValid) {
            $("#logoutBtn").click(async function (e) { 
                let token = utils.getCookie('authToken');

                let result = await Swal.fire({
                    icon: "warning",
                    title: "Đăng xuất?",
                    html: "Bạn chắc chắn muốn đăng xuất?",
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Đồng ý",
                    cancelButtonText: "Huỷ",
                });
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed && token) {
                    $.ajax({
                        type: "POST",
                        url: "/api/auth/logout",
                        contentType: "application/json",
                        data: JSON.stringify({
                            token: token
                        }),
                        success: function (res) {
                            if(res.code==1000){
                                Toast.fire({
                                    icon: "success",
                                    title: "Đã đăng xuất",
                                    didClose: () => {
                                        utils.deleteCookie('authToken');
                                        utils.setLocalStorageObject('userInfo', null);
                                        window.location.reload();
                                    }
                                });
                            }else{
                                Toast.fire({
                                    icon: "error",
                                    title: "Lỗi",
                                    didClose: () => {
                                        utils.deleteCookie('authToken');
                                        utils.setLocalStorageObject('userInfo', null);
                                        window.location.reload();
                                    }
                                });
                            }
                        },
                        error: function (xhr, status, error) {
                            Toast.fire({
                                icon: "error",
                                title: "Internal server error",
                                didClose: () => {
                                    utils.deleteCookie('authToken');
                                    utils.setLocalStorageObject('userInfo', null);
                                    window.location.reload();
                                }
                            });
                        },
                    });
                }
            });
        } 
    });

});


// Cập nhật breadcrumb dựa trên quyền
function updateBreadcrumb(roles) {
    // Xác định mối quan hệ giữa các trang con và cha
    const breadcrumbMap = {
        '/fund-management': { 
            parent: 'Quản lý quỹ', 
            parentUrl: '/fund-management', 
            title: 'Thông tin quỹ', 
            permissions: ['GET_FUNDS_BY_FILTER'] 
        },
        '/fund-management': { 
            parent: 'Quản lý quỹ', 
            parentUrl: '/fund-management', 
            title: 'Thông tin quỹ', 
            permissions: ['FILTER_FUNDS_BY_TREASURER'] 
        },
        '/fund-permission': { 
            parent: 'Quản lý quỹ', 
            parentUrl: '/fund-management', 
            title: 'Phân quyền giao dịch', 
            permissions: ['FILTER_FUND_PERMISSIONS_BY_TREASURER'] 
        },

        '/contribution-management': { 
            parent: 'Quản lý giao dịch', 
            parentUrl: '/contribution-management', 
            title: 'Quản lý đóng góp', 
            permissions: ['GET_CONTRIBUTION_BY_FILTER'] 
        },
        '/contribution-management': { 
            parent: 'Quản lý giao dịch', 
            parentUrl: '/contribution-management', 
            title: 'Quản lý đóng góp', 
            permissions: ['FILTER_CONTRIBUTION_BY_TREASURER'] 
        },
        '/transaction-contribute': { 
            parent: 'Quản lý giao dịch', 
            parentUrl: '/transaction-contribute', 
            title: 'Đóng góp quỹ', 
            permissions: ['GET_FUNDS_USER_CAN_CONTRIBUTE'] 
        },
        '/withdrawal-management': { 
            parent: 'Quản lý giao dịch', 
            parentUrl: '/withdrawal-management', 
            title: 'Quản lý rút quỹ', 
            permissions: ['GET_WITHDRAW_BY_FILTER'] 
        },
        '/transaction-withdraw': { 
            parent: 'Quản lý giao dịch', 
            parentUrl: '/transaction-contribute', 
            title: 'Rút quỹ', 
            permissions: ['GET_USER_WITHDRAWALS_BY_FILTER'] 
        },

        '/payment-management': { 
            parent: 'Quản lý thanh toán', 
            parentUrl: '/payment-management', 
            title: 'Quản lý đề nghị', 
            permissions: ['FILTER_PAYMENT_REQUEST'] 
        },
        '/payment-management': { 
            parent: 'Quản lý thanh toán', 
            parentUrl: '/payment-management', 
            title: 'Quản lý đề nghị', 
            permissions: ['FILTER_PAYMENT_REQUESTS_BY_TREASURER'] 
        },
        '/payment-request': { 
            parent: 'Quản lý thanh toán', 
            parentUrl: '/payment-request', 
            title: 'Đề nghị thanh toán', 
            permissions: ['GET_USER_PAYMENT_REQUESTS_BY_FILTER'] 
        },

        '/account-management': { 
            parent: 'Quản lý tài khoản', 
            parentUrl: '/account-management', 
            title: 'Quản lý tài khoản',
            permissions: ['GET_USERS_BY_FIFLTER']  
        },

        '/fund-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/fund-report', 
            title: 'Báo cáo tổng quan', 
            permissions: ['GET_FUND_REPORT_FILTER'] 
        },
        '/fund-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/fund-report', 
            title: 'Báo cáo tổng quan', 
            permissions: ['GET_FUND_REPORT_BY_TREASURER'] 
        },
        '/contribution-transaction-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/contribution-transaction-report', 
            title: 'Báo cáo đóng góp',
            permissions: ['GET_TREASURER_CONTRIBUTION_REPORT']  
        },
        '/contribution-transaction-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/contribution-transaction-report', 
            title: 'Báo cáo đóng góp',
            permissions: ['GET_TRANSACTION_REPORT']  
        },
        '/withdrawal-transaction-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/withdrawal-transaction-report', 
            title: 'Báo cáo rút quỹ', 
            permissions: ['GET_TREASURER_WITHDRAWAL_REPORT'] 
        },
        '/withdrawal-transaction-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/withdrawal-transaction-report', 
            title: 'Báo cáo rút quỹ', 
            permissions: ['GET_TRANSACTION_REPORT'] 
        },
        '/payment-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/payment-report', 
            title: 'Báo cáo thanh toán', 
            permissions: ['GET_TREASURER_PAYMENT_REPORT'] 
        },
        '/payment-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/payment-report', 
            title: 'Báo cáo thanh toán', 
            permissions: ['GET_PAYMENT_REPORT'] 
        },
        '/individual-contribution-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/individual-contribution-report', 
            title: 'Đóng góp cá nhân', 
            permissions: ['GET_INDIVIDUAL_CONTRIBUTION_REPORT'] 
        },
        '/individual-payment-report': { 
            parent: 'Thống kê báo cáo', 
            parentUrl: '/individual-payment-report', 
            title: 'Thanh toán cá nhân', 
            permissions: ['GET_INDIVIDUAL_PAYMENT_REPORT'] 
        },

        '/department-list': { 
            parent: 'Quản lý danh mục', 
            parentUrl: '/department-list', 
            title: 'Danh mục phòng ban', 
            permissions: ['CREATE_DEPARTMENT'] 
        },
        '/transaction-type': { 
            parent: 'Quản lý danh mục', 
            parentUrl: '/transaction-type', 
            title: 'Loại giao dịch', 
            permissions: ['CREATE_TRANSACTION_TYPE'] 
        }
    };
    
    // // Nhóm các trang con dưới cùng một trang cha
    const parentChildMap = {
        'Quản lý quỹ': ['/fund-management', '/fund-permission'],
        'Quản lý thanh toán': ['/payment-management', '/payment-request'],
        'Quản lý giao dịch': ['/contribution-management', '/transaction-contribute', '/withdrawal-management', '/transaction-withdraw'],
        'Quản lý tài khoản': ['/account-management'], 
        'Thống kê báo cáo': ['/fund-report', '/contribution-transaction-report', '/withdrawal-transaction-report', '/payment-report', '/individual-contribution-report', '/individual-payment-report'],
        'Quản lý danh mục': ['/department-list', '/transaction-type'],
    };

    const currentPath = window.location.pathname;
    const breadcrumb = document.getElementById('breadcrumb');
    const permissions = getPermissionsFromRoles(roles);

    // Nếu URL hiện tại tồn tại trong breadcrumbMap
    if (breadcrumbMap[currentPath]) {
        const { parent, title } = breadcrumbMap[currentPath];

        // Tạo breadcrumb cho trang cha
        const parentCrumb = document.createElement('li');
        parentCrumb.classList.add('breadcrumb-item', 'dropdown');

        const dropdownLink = document.createElement('a');
        dropdownLink.href = '#';
        dropdownLink.classList.add('dropdown');
        dropdownLink.setAttribute('data-toggle', 'dropdown');
        dropdownLink.textContent = parent;
        parentCrumb.appendChild(dropdownLink);

        // Tạo danh sách con (nếu có)
        if (parentChildMap[parent]) {
            const dropdownMenu = document.createElement('ul');
            dropdownMenu.classList.add('dropdown-menu');

            parentChildMap[parent].forEach(function (childPath) {
                // Kiểm tra quyền của người dùng
                const childPermissions = breadcrumbMap[childPath].permissions || [];
                const hasPermission = childPermissions.every(permission => permissions.includes(permission));

                if (hasPermission) {
                    const childCrumb = document.createElement('li');
                    const childLink = document.createElement('a');
                    childLink.classList.add('dropdown-item');
                    childLink.href = childPath;
                    childLink.textContent = breadcrumbMap[childPath].title;
                    childCrumb.appendChild(childLink);
                    dropdownMenu.appendChild(childCrumb);
                }
            });

            // Nếu có ít nhất một mục trong danh sách con, thêm vào breadcrumb
            if (dropdownMenu.children.length > 0) {
                parentCrumb.appendChild(dropdownMenu);
            }
        }

        breadcrumb.appendChild(parentCrumb);

        // Tạo breadcrumb cho trang hiện tại
        const currentCrumb = document.createElement('li');
        currentCrumb.classList.add('breadcrumb-item', 'active');
        currentCrumb.setAttribute('aria-current', 'page');
        currentCrumb.textContent = title;
        breadcrumb.appendChild(currentCrumb);
    }
}

// Lấy danh sách permissions từ roles
function getPermissionsFromRoles(roles) {
    let permissions = [];
    roles.forEach(role => {
        role.permissions.forEach(permission => {
            if (!permissions.includes(permission.id)) {
                permissions.push(permission.id);
            }
        });
    });
    return permissions;
}


// Hiển thị tên của người dùng trên thanh Navbar
async function loadName() {
    let userInfo = await utils.getUserInfo();
    if (!userInfo) {
        Toast.fire({
            icon: "error",
            title: "Không thể lấy thông tin người dùng!"
        });
        return;
    }
    else {
        $('#loggedInUser').text(userInfo.fullname);

        // Thêm sự kiện khi nhấn vào tên người dùng sẽ chuyển đến trang my-info.html
        $('#loggedInUser').on('click', function () {
            window.location.href = '/my-info.html';
        });
    }
}

