export const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");
  
    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return cookie.split("=")[1];
        }
    }
    return null; // Return null if the cookie is not found
};

// lấy giá trị token từ cookie
export function check_token() {
    var token = getCookie("authToken");
}
  
//  tự động xóa cookie
export const deleteCookie = (name) => {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
};

// thiết lập AJAX mặc định với token xác thực người dùng
export function setAjax() {
    const authToken = getCookie("authToken");
    // console.log(authToken);
    if (authToken != null) {
        $.ajaxSetup({
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });
    }
}

// kiểm tra token có hợp lệ hay không
export function introspect() {
    let token = getCookie('authToken');
    
    if (token) {
        $.ajax({
            type: "POST",
            url: "/api/auth/introspect",
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ 
                token: token 
            }),
            success: function (res) {
                if (res.code == 1000) {
                    if (res.result.valid == false) {
                        deleteCookie("authToken");
                        window.location.href = "/login";
                    }
                }
            },
            error: function (res) {
                deleteCookie("authToken");
            },
        });
    }
    else {
      window.location.href = "/login";
    }
}

// làm mới token
export function refreshToken() {
    // kiểm tra xem người dùng có token hiện tại không
    return new Promise((resolve, reject) => {
        const token = getCookie("authToken");

        if (token) {
            $.ajax({
                type: "POST",
                url: "/api/auth/refresh",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ 
                    token: token 
                }),
                success: function (res) {
                    if (res.code == 1000) {
                        // Lưu token mới vào cookie
                        const newToken = res.result.token;
                        document.cookie = `authToken=${newToken}; path=/;`;
                        resolve(true);
                    } else {
                        deleteCookie("authToken");
                        window.location.href = "/login";
                        resolve(false);
                    }
                },
                error: function () {
                    deleteCookie("authToken");
                    window.location.href = "/login";
                    reject(false);
                },
            });
        } else {
            window.location.href = "/login";
            reject(false);
        }
    });
}


// kiểm tra trạng thái đăng nhập của người dùng
export function is_login() {
    return new Promise((resolve, reject) => {
        let token = getCookie('authToken');
      
        if (token) {
            $.ajax({
                type: "POST",
                url: "/api/auth/introspect",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ 
                    token: token 
                }),
                success: function (res) {
                    if (res.code == 1000 && res.result.valid) {
                        resolve(true);
                    } else {
                        deleteCookie("authToken");
                        resolve(false);
                    }
                },
                error: function () {
                    deleteCookie("authToken");
                    resolve(false);
                },
            });
        } else {
            resolve(false);
        }
    });
}

// kiểm tra trạng thái đăng nhập của người dùng
export function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        let token = getCookie('authToken');
        
        if (token) {
            $.ajax({
                type: "POST",
                url: "/api/auth/introspect",
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ 
                    token: token 
                }),
                success: function (res) {          
                    if (res.code == 1000 && res.result.valid) {
                        resolve(true);
                    } else {
                        deleteCookie("authToken");
                        resolve(false);
                    }
                },
                error: function () {
                    console.log('Login status: '+loginStatus);
                    deleteCookie("authToken");
                    resolve(false);
                },
            });
        } else {
            resolve(false);
        }
    });
}

// Kiểm tra xem script đã tồn tại chưa
export function loadScript(url) {
    if (!document.querySelector(`script[src="${url}"]`)) {
        let script = document.createElement('script');
        script.src = url;
        script.onload = function() {
            console.log('Script loaded successfully.');
        };
        document.head.appendChild(script);
    }
}

export function getErrorMessage(code) {
    for (let key in ErrorCode) {
        if (ErrorCode[key].code === code) {
            return ErrorCode[key].message;
        }
    }
    return "Mã lỗi không xác định";
}