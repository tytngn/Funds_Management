import ErrorCode from '/js/pages/ErrorCode.js';

// lấy giá trị của một cookie dựa trên tên của cookie
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
  
//  tự động xóa cookie
export const deleteCookie = (name) => {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
};

// header mặc định cho yêu cầu HTTP
export function defaultHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getCookie("authToken")
    };
}

// kiểm tra token có hợp lệ hay không
export function introspect(bool) {
    let token = getCookie('authToken');
    let path = "";
    if(bool) {
      path = window.location.href.split("/").slice(-1)[0]; // giữ lại trang người dùng đang truy cập để quay lại sau khi đăng nhập
    }

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
                        setLocalStorageObject('userInfo', null);
                        if(bool) {
                            window.location.href = "/login#" + path;
                        }
                        else {
                            window.location.href = "/login";
                        }
                    }
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    // Xử lý lỗi 401 (Unauthorized)
                    deleteCookie("authToken");
                    setLocalStorageObject('userInfo', null);
                    if (bool) {
                        window.location.href = "/login#" + path;
                    } else {
                        window.location.href = "/login";
                    }
                } else {
                    // Xử lý các lỗi khác nếu cần
                    console.error("Error: ", xhr);
                }
            },
        });
    }
    else {
        setLocalStorageObject('userInfo', null);
        if(bool) {
            window.location.href = "/login#" + path;
        }
        else {
            window.location.href = "/login";
        }
    }
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
                        setLocalStorageObject('userInfo', null);
                        resolve(false);
                    }
                },
                error: function () {
                    console.log('Login status: '+loginStatus);
                    deleteCookie("authToken");
                    setLocalStorageObject('userInfo', null);
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

// Trả về thông báo lỗi tương ứng với mã lỗi
export function getErrorMessage(code) {
    for (let key in ErrorCode) {
        if (ErrorCode[key].code === code) {
            return ErrorCode[key].message;
        }
    }
    return "Mã lỗi không xác định";
}

// xử lý lỗi Ajax
export function handleAjaxError(xhr) {
    var code = 9999;
    var message = 'Lỗi không xác định, không có mã lỗi';
    try {
        var response = JSON.parse(xhr.responseText);

        if (response.code) {
            code = response.code;
            message = getErrorMessage(code);
        }
    } catch (e) {
        // Lỗi khi parse JSON
        console.log("JSON parse error");
        message = 'Lỗi không xác định, không có mã lỗi';
    }
    return {
        code: code,
        message: message,
    }
}

// Hàm lưu Object vào localStorage
export function setLocalStorageObject(key, value) {
    if (!key) {
      console.error('Key không hợp lệ!');
      return;
    }
  
    try {
      if (value === null) {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
        }
      } else {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error('Local storage - set object error:', error);
    }
}
  
// Hàm lấy Object từ localStorage
export function getLocalStorageObject(key) {
    if (!key) {
      console.error('Local storage: Invalid key!');
      return null;
    }
  
    try {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue == null || jsonValue == undefined) {
        return null;
      }      
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error('Local storage - get object error:', error);
      return null;
    }
}

export async function getUserInfo() {
    if (getCookie("authToken") != null) {
        let userInfo = getLocalStorageObject("userInfo");
        
        if (userInfo == null) {
            try {
                const res = await $.ajax({
                    type: "GET",
                    url: "/api/users/my-info",
                    headers: defaultHeaders(),
                    dataType: "json",
                });

                if (res.code === 1000) {
                    setLocalStorageObject('userInfo', res.result);
                    return res.result;
                } else {
                    console.error('Lỗi lấy thông tin người dùng:', res);
                    return null;
                }
            } catch (error) {
                console.error('Lỗi khi thực hiện AJAX:', error);
                return null;
            }
        } else {
            return userInfo;
        }
    } else {
        setLocalStorageObject('userInfo', null);
        console.log("Token not found");
        return null;
    }
}


export function setHashParam(key, value) {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
  
    if (value !== null && value !== undefined) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  
    // Nếu không có tham số nào, bỏ hash hoàn toàn
    const newHash = params.toString();
    window.location.hash = newHash ? newHash : '';
}

export function getHashParam(key) {
    const hash = window.location.hash.substring(1);
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const value = params.has(key) ? params.get(key) : null;

    return value !== null && value !== "" ? value : null;
}


// Hàm định dạng ngày tháng năm
export function formatDate(dateString) {
    if (!dateString) return ''; // Kiểm tra giá trị null hoặc rỗng
    var date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hàm định dạng giờ phút giây ngày tháng năm
export function formatDateTime(dateString) {
    if (!dateString) return ''; // Kiểm tra giá trị null hoặc rỗng
    var date = new Date(dateString);
    
    // Lấy thông tin giờ, phút, giây
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    
    // Định dạng ngày tháng năm
    var datePart = date.toLocaleDateString('vi-VN');
    
    // Kết hợp ngày tháng năm và giờ phút giây
    return `${hours}:${minutes}:${seconds} ${datePart}`;
}


// Hàm định dạng số theo chuẩn Việt Nam
export function formatNumber(value) {
    return value.toLocaleString('vi-VN');
}

// Hàm định dạng tiền tệ theo chuẩn Việt Nam, thêm kí hiệu đ
export function formatCurrency(value) {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}


// Hàm xử lý kiểu dữ liệu của số tiền trước khi gửi form (chuyển thành kiểu double)
export function getRawValue(selector) {
    const formattedValue = $(selector).val(); // Lấy giá trị từ input thông qua jQuery
    const rawValue = formattedValue.replace(/\./g, ''); // Loại bỏ dấu chấm
    return parseFloat(rawValue); // Chuyển thành số thực (double)
}


// Hàm chuyển đổi hình ảnh thành base64
export function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}


// Xoá nội dung trong modal
export function clear_modal() {
    $("#modal-title").empty();
    $("#modal-body").empty();
    $("#modal-footer").empty();
}