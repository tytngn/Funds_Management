import * as utils from "/js/pages/utils.js";

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

$(document).ready(function(){

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