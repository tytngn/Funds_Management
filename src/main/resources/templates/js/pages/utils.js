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

export function check_token() {
    var token = getCookie("authToken");
}
  
export const deleteCookie = (name) => {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
};

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

export function introspect() {
    // Hàm kiểm tra token có hợp lệ hay không, nếu không thì trả về trang index
    let token = getCookie('authToken');
    
    if (token) {
        $.ajax({
            type: "POST",
            url: "/api/auth/introspect",
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ token: token }),
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
                data: JSON.stringify({ token: token }),
                success: function (res) {
                    if (res.code == 1000 && res.data.valid) {
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

export function loadScript(url) {
    // Kiểm tra xem script đã tồn tại chưa
    if (!document.querySelector(`script[src="${url}"]`)) {
        let script = document.createElement('script');
        script.src = url;
        script.onload = function() {
            console.log('Script loaded successfully.');
        };
        document.head.appendChild(script);
    }
}