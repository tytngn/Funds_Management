import * as utils from "/js/pages/services/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dob;

$(document).ready(function () {
    // Select 
    $('.select2').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    // Date Picker
    $('#dob').daterangepicker({
        singleDatePicker: true,
        autoUpdateInput: false,
        showDropdowns: true,
        opens: 'center',
        locale: {
            cancelLabel: 'Huỷ',
            applyLabel: 'Áp dụng',
            format: 'DD/MM/YYYY',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            firstDay: 1 // Đặt ngày đầu tuần là thứ 2
        }
    });

    // Nút "Áp dụng" trong Date Picker
    $('#dob').on('apply.daterangepicker', function(ev, picker) {
        // Hiển thị lên ô input
        $(this).val(picker.startDate.format('DD/MM/YYYY'));

        dob = picker.startDate.format('YYYY-MM-DD');
    });
    // Nút "Huỷ" trong Date Picker
    $('#dob').on('cancel.daterangepicker', function(ev, picker) {
        dob = '';
        $(this).val('');
    });

    // Hiển thị danh sách ngân hàng
    populateBankSelect();

    // Hiển thị đữ liệu
    loadData();

});


async function loadData(){
    utils.setLocalStorageObject("userInfo", null);
    const userInfo = await utils.getUserInfo();
    if (userInfo !== null) {
        // Gán giá trị vào các ô input
        $("#username").val(userInfo.username);
        $("#email").val(userInfo.email);
        $("#fullname").val(userInfo.fullname);
        $("#phone").val(userInfo.phone);
        $("#gender").val(userInfo.gender).trigger('change');
        $("#department").val(userInfo.department ? userInfo.department.name : '');
        $("#bank-select").val(userInfo.account ? userInfo.account.bankName : '').trigger('change');
        $("#account-number").val(userInfo.account ? userInfo.account.accountNumber : '');
        
        // Hiển thị giá trị dob vào Date Picker
        if (userInfo.dob) {
            let dobMoment = moment(userInfo.dob, 'YYYY-MM-DD'); // Định dạng ngày từ API
            $('#dob').val(dobMoment.format('DD/MM/YYYY')); // Hiển thị ngày lên input với định dạng 'DD/MM/YYYY'
            
            // Cập nhật Date Picker với giá trị đã có
            $('#dob').data('daterangepicker').setStartDate(dobMoment);

            dob = userInfo.dob; 
        }
    } else {
        console.log("Không thể load thông tin người dùng");
    }
}


// Lấy danh sách ngân hàng
function populateBankSelect() {
    // Danh sách các tên ngân hàng
    var banks = [
        "Vietcombank",
        "BIDV",
        "VietinBank",
        "Agribank",
        "Techcombank",
        "ACB",
        "MB Bank",
        "Sacombank",
        "HDBank",
        "TPBank",
        "VIB",
        "VPBank",
        "SeABank",
        "Eximbank",
        "SCB",
        "ABBank",
        "ABC",
        "ANZ Bank Viet Nam",
        "BacABank",
        "BaovietBank",
        "CBBank",
    ];

    var bankSelect = $('#bank-select'); // Lấy phần tử select bằng id

    // Thêm các option vào select
    $.each(banks, function(index, bank) {
        bankSelect.append('<option value="' + bank + '">' + bank + '</option>');
    });
    bankSelect.val("").trigger('change');
}


// Nhấn nút "Lưu"
$("#submit-btn").on("click", function(e) {
    // Lấy dữ liệu từ các trường 
    const request = {
        username: $('#username').val(),
        email: $('#email').val(),
        fullname: $('#fullname').val(),
        dob: dob,
        gender: $('#gender').val(),
        phone: $('#phone').val(),
        bankName: $('#bank-select').val(),
        accountNumber: $('#account-number').val()
    };    

    // Gọi API để cập nhật thông tin tài khoản
    $.ajax({
        url: '/api/users', // Đường dẫn API
        type: 'PUT', // Sử dụng phương thức PUT để cập nhật
        headers: utils.defaultHeaders(),
        data: JSON.stringify(request),
        success: function (res) {
            if (res.code === 1000) {                
                Toast.fire({
                    icon: "success",
                    title: "Cập nhật thành công!",
                    timer: 3000,
                });
            } 
            else {
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            var err = utils.handleAjaxError(xhr);
            Toast.fire({
                icon: "error",
                title: err.message
            });
        }
    });
});