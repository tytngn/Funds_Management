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
        '/payment-request': { parent: 'Quản lý thanh toán', parentUrl: '/payment-request', title: 'Đề nghị thanh toán' },
        '/transaction-contribute': { parent: 'Quản lý giao dịch', parentUrl: '/transaction-contribute', title: 'Đóng góp quỹ' },
        '/transaction-withdraw': { parent: 'Quản lý giao dịch', parentUrl: '/transaction-contribute', title: 'Rút quỹ' }
    };

    // Nhóm các trang con dưới cùng một trang cha
    const parentChildMap = {
        'Quản lý quỹ': ['/fund-management', '/fund-permission'],
        'Quản lý thanh toán': ['/payment-request'],
        'Quản lý giao dịch': ['/transaction-contribute', '/transaction-withdraw']
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
        breadcrumb.appendChild(parentCrumb);

        // Tạo breadcrumb cho trang hiện tại
        const currentCrumb = document.createElement('li');
        currentCrumb.classList.add('breadcrumb-item', 'active');
        currentCrumb.setAttribute('aria-current', 'page');
        currentCrumb.textContent = title;
        breadcrumb.appendChild(currentCrumb);
    }


    // Đăng xuất
    utils.checkLoginStatus().then(isValid => {
        if (isValid) {
            $("#logoutBtn").click(function (e) { 
                let token = utils.getCookie('authToken');
                Swal.fire({
                    title: "Đăng xuất?" ,
                    showDenyButton: false,
                    showCancelButton: true,
                    confirmButtonText: "Đồng ý",
                    cancelButtonText: "Huỷ",
                }).then((result) => {
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
                                            window.location.reload();
                                        }
                                    });
                                }else{
                                    Toast.fire({
                                        icon: "error",
                                        title: "Lỗi",
                                        didClose: () => {
                                            utils.deleteCookie('authToken');
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
                                        window.location.reload();
                                    }
                                });
                            },
                        });
                    }
                });
            });
        } 
    });
  

});