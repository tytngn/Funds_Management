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
    $.ajax({
        url: "/api/auth/login",
        type: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({ username: username, password: password }),
        success: function (res) {
            if (res.code === 1000 && res.result.authenticated) {
                // Gửi yêu cầu với Bearer Token
                window.location.href = '/';
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

            setTimeout(function () {
                let response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                if (response && response.message) {
                    Toast.fire({
                        icon: "error",
                        title: response.message + " - " + response.code,
                    });
                }
                console.log(xhr.status);
                console.log(status);
                console.log(error);
            }, 3000);
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

