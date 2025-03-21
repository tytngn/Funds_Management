// lấy giá trị của một cookie dựa trên tên của cookie
const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");
  
    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return cookie.split("=")[1];
        }
    }
    return null; // Return null if the cookie is not found
};

// làm mới token
function refreshToken() {
    let token = getCookie("authToken");

    if (token == null) {
        console.error("Error: Token not found.");
        return;
    }

    let expirationTime = localStorage.getItem("tokenExpirationTime");    
    
    if (expirationTime) {
        const currentTime = Date.now();
        expirationTime = parseInt(expirationTime);

        if ((expirationTime - currentTime) > 60 * 60 * 1000) {
            console.log("**Token already refreshed**");
            
            return;
        }
    }

    $.ajax({
        type: "POST",
        url: "/api/auth/refresh",
        headers: {
            "Content-Type": "application/json",
            "Authorizaton": ""
        },
        data: JSON.stringify({ 
            token: token 
        }),
        dataType: "json",
        success: function (res) {
            console.log("ajax come");
            
            if (res.code == 1000 && res.result.authenticated) {
                console.log("**Token refreshed successfully.**");

                 // Lưu thời gian hết hạn vào localStorage (60 phút kể từ bây giờ)
                 const expirationTime = Date.now() + 24 * 60 * 60  * 1000; // 1 ngày
                 localStorage.setItem("tokenExpirationTime", expirationTime);
            } else {
                console.warn(res);
                
                console.log("Failed to refresh token.");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error refreshing token:", error);
            console.log(xhr);
        },
    });
}

refreshToken();

setInterval(() => {
    refreshToken();
}, 3600000);