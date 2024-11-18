import * as utils from "/js/pages/services/utils.js";

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

$(document).ready(function(){
    
// Phần breadcrumb

    // Xác định mối quan hệ giữa các trang con và cha
    const breadcrumbMap = {
        '/fund-management': { parent: 'Quản lý quỹ', parentUrl: '/fund-management', title: 'Thông tin quỹ' },
        '/fund-permission': { parent: 'Quản lý quỹ', parentUrl: '/fund-management', title: 'Phân quyền giao dịch' },
        
        '/contribution-management': { parent: 'Quản lý giao dịch', parentUrl: '/contribution-management', title: 'Quản lý đóng góp' },
        '/transaction-contribute': { parent: 'Quản lý giao dịch', parentUrl: '/transaction-contribute', title: 'Đóng góp quỹ' },
        '/withdrawal-management': { parent: 'Quản lý giao dịch', parentUrl: '/withdrawal-management', title: 'Quản lý rút quỹ' },
        '/transaction-withdraw': { parent: 'Quản lý giao dịch', parentUrl: '/transaction-contribute', title: 'Rút quỹ' },

        '/payment-management': { parent: 'Quản lý thanh toán', parentUrl: '/payment-management', title: 'Quản lý đề nghị' },
        '/payment-request': { parent: 'Quản lý thanh toán', parentUrl: '/payment-request', title: 'Đề nghị thanh toán' },

        '/account-management': { parent: 'Quản lý tài khoản', parentUrl: '/account-management', title: 'Quản lý tài khoản' },

        '/fund-report': { parent: 'Thống kê báo cáo', parentUrl: '/fund-report', title: 'Báo cáo tổng quan' },
        '/contribution-transaction-report': { parent: 'Thống kê báo cáo', parentUrl: '/contribution-transaction-report', title: 'Báo cáo đóng góp' },
        '/withdrawal-transaction-report': { parent: 'Thống kê báo cáo', parentUrl: '/withdrawal-transaction-report', title: 'Báo cáo rút quỹ' },
        '/payment-report': { parent: 'Thống kê báo cáo', parentUrl: '/payment-report', title: 'Báo cáo thanh toán' },
        '/individual-contribution-report': { parent: 'Thống kê báo cáo', parentUrl: '/individual-contribution-report', title: 'Đóng góp cá nhân' },
        '/individual-payment-report': { parent: 'Thống kê báo cáo', parentUrl: '/individual-payment-report', title: 'Thanh toán cá nhân' },

        '/department-list': { parent: 'Quản lý danh mục', parentUrl: '/department-list', title: 'Danh mục phòng ban' },
        '/transaction-type': { parent: 'Quản lý danh mục', parentUrl: '/transaction-type', title: 'Loại giao dịch' },
    };

    // Nhóm các trang con dưới cùng một trang cha
    const parentChildMap = {
        'Quản lý quỹ': ['/fund-management', '/fund-permission'],
        'Quản lý thanh toán': ['/payment-management', '/payment-request'],
        'Quản lý giao dịch': ['/contribution-management', '/transaction-contribute', '/withdrawal-management', '/transaction-withdraw'],
        'Quản lý tài khoản': ['/account-management'], 
        'Thống kê báo cáo': ['/fund-report', '/contribution-transaction-report', '/withdrawal-transaction-report', '/payment-report', '/individual-contribution-report', '/individual-payment-report'],
        'Quản lý danh mục': ['/department-list', '/transaction-type'],
    };

    // Lấy URL hiện tại
    const currentPath = window.location.pathname;

    // chèn nội dung breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');

    // Nếu URL hiện tại tồn tại trong breadcrumbMap
    if (breadcrumbMap[currentPath]) {
        const { parent, title } = breadcrumbMap[currentPath];

        // Tạo một mục danh sách cho breadcrumb của trang cha
        const parentCrumb = document.createElement('li');
        parentCrumb.classList.add('breadcrumb-item', 'dropdown');

        const dropdownLink = document.createElement('a');
        dropdownLink.href = '#';
        dropdownLink.classList.add('dropdown');
        dropdownLink.setAttribute('data-toggle', 'dropdown');
        dropdownLink.textContent = parent;
        parentCrumb.appendChild(dropdownLink);

        // Nếu parent không phải là 'Quản lý tài khoản', tạo danh sách con
        if (parent !== 'Quản lý tài khoản') {
            // Tạo một danh sách không có thứ tự để chứa các trang con.
            const dropdownMenu = document.createElement('ul');
            dropdownMenu.classList.add('dropdown-menu');

            // tạo ra từng mục danh sách và liên kết cho từng trang con tương ứng
            parentChildMap[parent].forEach(function (childPath) {
                const childCrumb = document.createElement('li');
                const childLink = document.createElement('a');
                childLink.classList.add('dropdown-item');
                childLink.href = childPath;
                childLink.textContent = breadcrumbMap[childPath].title;
                childCrumb.appendChild(childLink);
                dropdownMenu.appendChild(childCrumb);
            });

            parentCrumb.appendChild(dropdownMenu);
        }

        breadcrumb.appendChild(parentCrumb);

        if (parent !== 'Quản lý tài khoản') {
            const currentCrumb = document.createElement('li');
            currentCrumb.classList.add('breadcrumb-item', 'active');
            currentCrumb.setAttribute('aria-current', 'page');
            currentCrumb.textContent = title;
            breadcrumb.appendChild(currentCrumb);
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