import * as utils from "/js/pages/services/utils.js";
// sử dụng SweetAlert2
var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
});

const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");

    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return cookie.split("=")[1];
        }
    }
    return null;
};

function login() {
    let username = $("#username").val();
    let password = $("#password").val();
    if (username == null || username.trim() == "" || password == null || password.trim() == ""){
        Toast.fire({
            icon: "error",
            title: "Tên đăng nhập và mật khẩu không được trống!"
        });
        return;
    }
    $.ajax({
        url: "/api/auth/login",
        type: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({ username: username, password: password }),
        success: function (res) {
            if (res.code === 1000 && res.result.authenticated) {
                const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 1 ngày
                setTimeout(() => {
                    localStorage.setItem("tokenExpirationTime", expirationTime);
                    // Gửi yêu cầu với Bearer Token
                    window.location.href = '/';
                }, 500);
            } else {
                alert(res.code);
                Toast.fire({
                    icon: "warning",
                    title: res.message || "Đăng nhập thất bại",
                });
            }
        },
        error: function (xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: "Đăng nhập thất bại",
            });

            // setTimeout(function () {
            //     let response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            //     if (response && response.message) {
            //         Toast.fire({
            //             icon: "error",
            //             title: response.message + " - " + response.code,
            //         });
            //     }
            //     console.log(xhr.status);
            //     console.log(status);
            //     console.log(error);
            // }, 3000);
        },
    });
}

$("#signin-btn").click(function () {
    login();
});

document.getElementById("password").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        login();
    }
});

document.getElementById("username").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        login();
    }
});


// Hàm hiển thị hoặc ẩn mật khẩu
function togglePasswordVisibility(passwordInputId, toggleButtonId, iconId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleButton = document.getElementById(toggleButtonId);
    const toggleIcon = document.getElementById(iconId);

    toggleButton.addEventListener('click', function () {
        // Kiểm tra loại input hiện tại
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Thay đổi icon
        toggleIcon.classList.toggle('fa-eye');
        toggleIcon.classList.toggle('fa-eye-slash');
    });
}

$(document).ready(function () {
    utils.setLocalStorageObject('userInfo', null);
    // Hiển thị hoặc ẩn mật khẩu
    togglePasswordVisibility('password', 'toggle-password', 'toggle-icon');

    document.getElementById('forgot-password-link').addEventListener('click', function(event) {
        event.preventDefault(); // Ngăn chặn hành động mặc định của liên kết
        Toast.fire({
            icon: "info",
            title: "Vui lòng liên hệ quản trị viên để được cấp mật khẩu mới!"
        });
        return;
    });
});