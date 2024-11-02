import * as utils from "/js/pages/services/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable;
let selectedData; // Biến lưu dữ liệu đã chọn
var departmentOption = [];
var roleOption = [];

var startDate;
var endDate;

$(document).ready(function () {
    // Select 
    $('.select-2').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    // Bắt sự kiện thay đổi giá trị select "Loại bộ lọc"
    $('#filter-type-select').on('change', function() {
        var filterType = $(this).val();

        // Ẩn tất cả các trường trước
        $('#trans-times-div').prop("hidden", true);
        $('#status-div').prop("hidden", true);
        $('#department-div').prop("hidden", true);
        $('#role-div').prop("hidden", true);
        $('#bank-div').prop("hidden", true);


        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'time') {
            $('#trans-times-div').prop("hidden", false); // Hiển thị Date Picker
        } 
        else if (filterType === 'status') {
            $('#status-div').prop("hidden", false); // Hiển thị Select Trạng thái 
        }
        else if (filterType === 'department') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            $("#department-select").val("").trigger('change');
        }
        else if (filterType === 'role') {
            $('#role-div').prop("hidden", false);
            $("#role-select").val("").trigger('change');
        }
        else if (filterType === 'bank') {
            $('#bank-div').prop("hidden", false);
            populateBankSelect();
        }
    });

    // Date Picker
    $('input[name="datetimes"]').daterangepicker({
        autoUpdateInput: false,
        showDropdowns: true,
        linkedCalendars: false,
        opens: "right",
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
    $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
        // Hiển thị lên ô input
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

        startDate = picker.startDate.format('YYYY-MM-DD');
        endDate = picker.endDate.format('YYYY-MM-DD');
    });
    // Nút "Huỷ" trong Date Picker
    $('input[name="datetimes"]').on('cancel.daterangepicker', function(ev, picker) {
        startDate = '';
        endDate = '';
        $(this).val('');
    });

    // Gọi api để lấy phòng ban 
    $.ajax({
        type: "GET",
        url: "/api/departments",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let departments = res.result;
                let departmentDropdown = $("#department-select");
                departmentOption = [];

                departmentDropdown.empty();

                // Thêm các phòng ban vào dropdown
                departments.forEach(function(department) {
                    departmentOption.push({
                        id: department.id,
                        text: department.name
                    });
                    departmentDropdown.append(`
                        <option value="${department.id}">${department.name}</option>
                    `);              
                });
                departmentDropdown.val("").trigger('change');
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách phòng ban<br>" + res.message,
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

    // Gọi api để lấy role
    $.ajax({
        type: "GET",
        url: "/api/roles",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let roles = res.result;
                let roleDropdown = $("#role-select");
                roleOption = [];

                roleDropdown.empty();

                // Thêm các role vào dropdown
                roles.forEach(function(role) {
                    roleOption.push({
                        id: role.id,
                        text: role.roleName
                    });
                    roleDropdown.append(`
                        <option value="${role.id}">${role.roleName}</option>
                    `);              
                });
                roleDropdown.val("").trigger('change');
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách phân quyền<br>" + res.message,
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
            "SCB"
        ];

        var bankSelect = $('#bank-select'); // Lấy phần tử select bằng id

        // Thêm các option vào select
        $.each(banks, function(index, bank) {
            bankSelect.append('<option value="' + bank + '">' + bank + '</option>');
        });
        bankSelect.val("").trigger('change');
    }


    // Nhấn nút "Xem"
    $("#btn-view-user").on("click",async function () {    
        await loadUserData();
    });


    // Bảng danh sách tài khoản      
    dataTable = $('#user-table').DataTable({
        fixedHeader: true,
        autoWidth: false,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        language: {
            paginate: {
                next: "&raquo;",
                previous: "&laquo;"
            },
            lengthMenu: "Số dòng: _MENU_",
            info: "Tổng cộng: _TOTAL_ ", // Tùy chỉnh dòng thông tin
            infoEmpty: "Không có dữ liệu để hiển thị",
            infoFiltered: "(lọc từ _MAX_ mục)",
            emptyTable: "Không có dữ liệu",
        },
        searching: true,
        info: true,
        ordering: true,
        lengthChange: true,
        responsive: true,
        scrollX: true,        // Đảm bảo bảng có thể cuộn ngang
        scrollCollapse: true, // Khi bảng có ít dữ liệu, không cần thêm khoảng trống
        dom: 'lrtip',  // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columnDefs: [
            {
                targets: '_all', // Áp dụng cho tất cả các cột
                className: 'text-center align-middle' // Căn giữa nội dung của tất cả các cột
            },
            {
                targets: 1, // Cột tên 
                className: 'text-left align-middle', // Căn lề trái nội dung của cột tên 
            }
        ],

        columns: [
        { data: "number" },
        { data: "fullname", 
            render: function (data, type, row) {
                let html = "";
                if (row.account) {
                    html = `Ngân hàng : ${row.account.bankName} <br>
                            Số tài khoản: ${row.account.accountNumber} <br>
                            `;
                }
                let roleHtml = "";
                $.each(row.roles, function (idx, val) { 
                    if(idx != 0){
                        roleHtml += ", ";
                    }
                    roleHtml += val.roleName;
                });
                return `
                    <details>
                        <summary class="text-left">
                            <b>${data}</b>
                        </summary> <br>
                        <p class="text-left" style="white-space: normal; !important">
                            Username: ${row.username} <br>
                            Email: ${row.email} <br>
                            ${row.phone ? "Số điện thoại: " + row.phone : ""}<br> 
                            Phân quyền: ${roleHtml} <br>
                            ${html}
                            ${row.updateDate? "Ngày cập nhật: " + utils.formatDate(row.updateDate) : ""}
                        </p>
                    </details>`;
            }
        },
        { data: "gender",
            render: function (data, type, row) {
                if (data == 0) {
                    return `
                        <span class="badge badge-outline-info">
                            <i class="fas fa-male"></i> Nam
                        </span>`;
                } else {
                    return `
                        <span class="badge badge-outline-warning">
                            <i class="fas fa-female"></i> Nữ
                        </span>`;
                }
            }
        },
        { data: "dob", 
            render: function (data, type, row) {
                if (type === "display" || type === "filter") {
                    return utils.formatDate(data);
                }
                // Trả về giá trị nguyên gốc cho sorting và searching
                return new Date(data);
            }
        },
        { data: "department" },
        { data: "createDate", 
            render: function (data, type, row) {
                if (type === "display" || type === "filter") {
                    return utils.formatDate(data);
                }
                // Trả về giá trị nguyên gốc cho sorting và searching
                return new Date(data);
            }
        },
        { 
            data: "status",
            orderable: true, // Cho phép sắp xếp dựa trên cột này
            searchable: true, // Cho phép tìm kiếm dựa trên cột này
            render: function (data, type, row) {
                var statusClass = data === 1 || data === 9999 ? 'btn-inverse-success' : 'btn-inverse-danger';
                var statusText = data === 1 || data === 9999 ? 'Hoạt động' : 'Ngừng hoạt động';

                return `
                    <div class="d-flex justify-content-center align-items-center">
                        <button type="button" class="btn ${statusClass} btn-sm">${statusText}</button>
                    </div>
                `;
            }
        },
        ],
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api.column(0, { page: "current" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerHTML = start + i + 1;
                });
        },

        initComplete: function() {
            $('.dataTables_paginate').addClass('custom-paginate'); // phân trang của table
        },

    });
});


// Gọi api lấy dữ liệu danh sách các tài khoản
async function loadUserData() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
    var status = '';
    var departmentId = ''; 
    var role = ''; 
    var bankName = '';

    if (filter === 'time') {
        if (startDate === '' && endDate === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn thời gian!",
            });
            return;
        }
    }
    else if (filter === 'status') {
        status = $('#status-select').val() || ''; // Trạng thái
        if (status === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn trạng thái!",
            });
            return;
        }
    } 
    else if (filter === 'department') {
        departmentId = $('#department-select').val() || ''; // Phòng ban
        if (departmentId === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn phòng ban!",
            });
            return;
        }
    } 
    else if (filter === 'role') {
        role = $('#role-select').val() || ''; // Phân quyền của người dùng
        if (role === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn phân quyền!",
            });
            return;
        }
    } 
    else if (filter === 'bank') {
        bankName = $('#bank-select').val() || ''; // Tên ngân hàng
        if (bankName === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn ngân hàng!",
            });
            return;
        }
    }
   
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    await $.ajax({
        url: "/api/users/filter?start=" + startDate + "&end=" + endDate + "&status=" + status + "&departmentId=" + departmentId + "&roleId=" + role + "&bankName=" + bankName, 
        type: "GET",
        headers: utils.defaultHeaders(),
        beforeSend: function () {
            Swal.showLoading();
        },
        success: function(res) {
            Swal.close();
            if (res.code == 1000) {                    
                var data = [];
                var counter = 1;
                res.result.forEach(function (user) {                        
                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        username: user.username,
                        fullname: user.fullname,
                        gender: user.gender, 
                        email: user.email,
                        phone: user.phone,
                        dob: user.dob,
                        status: user.status,
                        roles: user.roles,
                        createDate: user.createdDate,
                        updateDate: user.updatedDate,
                        account: user.account,
                        department: user.department.name,
                        id: user.id, // ID của người dùng 
                    });
                });
                dataTable.clear().rows.add(data).draw();
            } else {
                Toast.fire({
                    icon: "error",
                    title: res.message || "Error in fetching data",
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            if (xhr.status == 401 || xhr.status == 403){
                Toast.fire ({
                    icon: "error",
                    title: "Bạn không có quyền truy cập!",
                    timer: 1500,
                    didClose: function() {
                        window.location.href = "/";
                    }
                });
            }
        },
    });
}

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


// Bắt sự kiện khi chọn dòng
$('#user-table tbody').on('click', 'tr', function () {
    // Kiểm tra xem dòng đã được chọn chưa
    if ($(this).hasClass('selected')) {
        // Nếu đã được chọn, bỏ chọn nó
        $(this).removeClass('selected');
        selectedData = null; // Đặt selectedData về null vì không có dòng nào được chọn
    } else {
        // Nếu chưa được chọn, xóa lựa chọn hiện tại và chọn dòng mới
        dataTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected'); // Đánh dấu dòng đã chọn
        selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
    }
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#user-search-input").on("keyup", function () {
  dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới"
$("#btn-add-user").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Tạo tài khoản mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-username-input">Tên đăng nhập</label>
            <input type="text" class="form-control" id="modal-username-input" placeholder="Nhập tên đăng nhập">
            <p class="card-description" style="color: #76838f;">Chỉ được phép chứa các chữ cái không dấu và không có khoảng trắng</p>
        </div>

        <div class="form-group">
            <label for="modal-email-input">Email</label>
            <input type="email" class="form-control" id="modal-email-input" placeholder="Nhập địa chỉ email">
        </div>

        <div class="form-group">
            <label for="modal-fullname-input">Họ và tên</label>
            <input type="text" class="form-control" id="modal-fullname-input" placeholder="Nhập họ và tên">
        </div>

        <div class="form-group">
            <label for="modal-gender-input">Giới tính</label>
            <select class="form-control" id="modal-gender-input" style="width: 100%;" data-placeholder="Chọn giới tính">
                <option value="" disabled selected>Chọn giới tính</option>
                <option value="0">Nam</option>
                <option value="1">Nữ</option>
            </select>
        </div>

        <div class="form-group">
            <label for="modal-department-input">Phòng ban</label>
            <select class="form-control" id="modal-department-input" style="width: 100%;" data-placeholder="Chọn phòng ban"></select>
        </div>

        <div class="form-group">
            <label for="modal-role-input">Phân quyền</label>
            <select class="form-control" id="modal-role-input" style="width: 100%;" multiple="multiple" data-placeholder="Chọn quyền"></select>
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

    $('#modal-gender-input').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    $('#modal-department-input').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: departmentOption
    });
    $("#modal-department-input").val("").trigger('change');

    $('#modal-role-input').select2({
        allowClear: true,
        closeOnSelect: false,
        data: roleOption
    });

    $("#modal-id").modal("show");


    // Lưu thông tin quỹ
    $("#modal-submit-btn").click(function () {
        let username = $("#modal-username-input").val();
        let email = $("#modal-email-input").val();
        let fullname = $("#modal-fullname-input").val();
        let gender = $("#modal-gender-input").val();
        let department = $("#modal-department-input").val();
        let roles = $("#modal-role-input").val();

        if (username == null || username.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên đăng nhập!"
            });
            return;
        } 
        else if (email == null || email.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập email!"
            });
            return;
        }
        else if (fullname == null || fullname.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập họ và tên!"
            });
            return;
        }
        else if (gender == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng chọn giới tính!"
            });
            return;
        }
        else if (department == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng chọn phòng ban!"
            });
            return;
        }
        else {
            Swal.showLoading();
            $.ajax({
                type: "POST",
                url: "/api/users",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    username: username,
                    email: email,
                    fullname: fullname,
                    gender: gender,
                    departmentId: department,
                    roleId: roles
                }),
                success: async function (res) {
                    Swal.close();
                    if(res.code==1000){
                        $("#modal-id").modal("hide");
                        await loadUserData();
                        Toast.fire({
                            icon: "success",
                            title: "Đã tạo tài khoản!",
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


// Nhấn nút "Cập nhật" 
$("#btn-update-user").on("click", function () {
    // Thêm class vào modal
    $("#modal-id").addClass("update-modal");

    if(selectedData){
        var userId = selectedData.id; // Lấy ID của user
        utils.clear_modal();
        Swal.showLoading();
        // Gọi API lấy thông tin người dùng theo userId
        $.ajax({
            type: "GET",
            url: "/api/users/" + userId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let user = res.result;
                    
                    $("#modal-title").text("Cập nhật tài khoản");
                    
                    // Hiển thị dữ liệu trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-username-input">Tên đăng nhập</label>
                                <input type="text" class="form-control" id="modal-username-input" placeholder="Nhập tên đăng nhập" value="${user.username}">
                                <p class="card-description" style="color: #76838f;">Chỉ được phép chứa các chữ cái không dấu và không có khoảng trắng</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="modal-email-input">Email</label>
                                <input type="email" class="form-control" id="modal-email-input" placeholder="Nhập địa chỉ email" value="${user.email}">
                            </div>

                            <div class="form-group">
                                <label for="modal-fullname-input">Họ và tên</label>
                                <input type="text" class="form-control" id="modal-fullname-input" placeholder="Nhập họ và tên" value="${user.fullname}">
                            </div>

                            <div class="form-group">
                                <label for="modal-dob-input">Ngày sinh</label>
                                <input class="form-control" id="modal-dob-input" type="text" name="datetimes" style="height: 34px;" placeholder="dd / mm / yyyy" value="${utils.formatDate(user.dob)}"/>
                            </div>

                            <div class="form-group">
                                <label for="modal-gender-input">Giới tính</label>
                                <select class="form-control" id="modal-gender-input" style="width: 100%;" data-placeholder="Chọn giới tính">
                                    <option value="" disabled selected>Chọn giới tính</option>
                                    <option value="0">Nam</option>
                                    <option value="1">Nữ</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="modal-phone-input">Số điện thoại</label>
                                <input type="text" class="form-control" id="modal-phone-input" placeholder="Nhập số điện thoại" value="${user.phone ? user.phone : ""}">
                            </div>

                            <div class="form-group">
                                <label for="modal-department-input">Phòng ban</label>
                                <select class="form-control" id="modal-department-input" style="width: 100%;" data-placeholder="Chọn phòng ban"></select>
                            </div>

                            <div class="form-group">
                                <label for="modal-role-input">Phân quyền</label>
                                <select class="form-control" id="modal-role-input" style="width: 100%;" multiple="multiple" data-placeholder="Chọn quyền"></select>
                            </div>

                            <div class="form-check form-check-flat form-check-primary">
                                <input id="modal-status-input" type="checkbox" class="form-check-input ml-0" ${user.status === 1 ? 'checked' : ''}>
                                <label class="form-check-label">Tài khoản đang hoạt động</label>
                            </div>

                        </form>
                    `);
                    
                    $("#modal-footer").append(`
                        <button type="submit" class="btn btn-primary mr-2" id="modal-update-btn">
                            <i class="fa-regular fa-floppy-disk mr-2"></i>Cập nhật
                        </button>
                        <button type="button" class="btn btn-outline-primary mr-2" id="modal-reset-btn">
                            <i class="fa-solid fa-key mr-2"></i>Đặt lại mật khẩu
                        </button>
                        <button class="btn btn-light" id="modal-cancel-btn">
                            <i class="fa-regular fa-circle-xmark mr-2"></i>Huỷ bỏ
                        </button>
                    `);
                    
                    // Date Picker
                    $('#modal-dob-input').daterangepicker({
                        dob: moment(user.dob),
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
                    var dob;
                    // Nút "Áp dụng" trong Date Range Picker
                    $('#modal-dob-input').on('apply.daterangepicker', function(ev, picker) {
                        // Hiển thị lên ô input
                        $(this).val(picker.startDate.format('DD/MM/YYYY'));

                        dob = picker.startDate.format('YYYY-MM-DD');
                    });
                    // Nút "Huỷ" trong Date Range Picker
                    $('#modal-dob-input').on('cancel.daterangepicker', function(ev, picker) {
                        dob = '';
                        $(this).val('');
                    });

                    $('#modal-gender-input').select2({
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                    });
                    $('#modal-gender-input').val(user.gender).trigger('change');

                    $('#modal-department-input').select2({
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                        data: departmentOption
                    });
                    $('#modal-department-input').val(user.department.id).trigger('change');

                    $('#modal-role-input').select2({
                        allowClear: true,
                        closeOnSelect: false,
                        data: roleOption
                    });
                    // Lấy danh sách các id role đã lưu trước đó từ user.roles
                    var savedRoles = user.roles.map(function(role) {
                        return role.id;
                    });
                    $('#modal-role-input').val(savedRoles).trigger('change');
                    

                    $("#modal-id").modal("show");


                    // Cập nhật tài khoản
                    $("#modal-update-btn").click(function () {
                        let username = $("#modal-username-input").val();
                        let email = $("#modal-email-input").val();
                        let fullname = $("#modal-fullname-input").val();
                        let gender = $("#modal-gender-input").val();
                        let phone = $("#modal-phone-input").val();
                        let department = $("#modal-department-input").val();
                        let roles = $("#modal-role-input").val();
                        let status = $("#modal-status-input").is(":checked") ? 1 : 0;
                    
                        // Kiểm tra nếu cần xác nhận
                        if (status === 0 && user.status !== status) {
                            Swal.fire({
                                title: 'Bạn có chắc chắn?',
                                text: "Bạn sẽ vô hiệu hoá tài khoản " + username,
                                icon: "warning",
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            }).then((result) => { 
                                if (result.isConfirmed){
                                    Swal.showLoading();
                                    // gọi api vô hiệu hoá tài khoản của người dùng 
                                    $.ajax({
                                        type: "PUT",
                                        url: "/api/users/disable/" + userId ,
                                        headers: utils.defaultHeaders(),
                                        success: async function (res) {
                                            Swal.close();
                                            if (res.code == 1000) {
                                                $("#modal-id").modal("hide");
                                                $(this).removeClass("update-modal");
                                                await loadUserData(); 
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Đã vô hiệu hoá tài khoản",
                                                });
                                            } else {
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
                        }
                        else {
                            Swal.showLoading();
                            $.ajax({
                                type: "PUT",
                                url: "/api/users/" + userId ,
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    username: username,
                                    email: email,
                                    fullname: fullname,
                                    dob: dob || user.dob,
                                    gender: gender,
                                    phone: phone,
                                    status: status,
                                    departmentId: department,
                                    roleId: roles
                                }),
                                success:async function (res) {
                                    Swal.close();
                                    if (res.code == 1000) {
                                        $("#modal-id").modal("hide");
                                        await loadUserData(); 
                                        $(this).removeClass("update-modal");
                                        Toast.fire({
                                            icon: "success",
                                            title: "Đã cập nhật tài khoản",
                                        });
                                    } else {
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


                    // Đặt lại mật khẩu
                    $("#modal-reset-btn").click(function () {
                        Swal.fire({
                            title: 'Bạn có chắc chắn?',
                            text: "Bạn sẽ đặt lại mật khẩu mặc địch cho tài khoản " + user.username,
                            icon: "warning",
                            showDenyButton: false,
                            showCancelButton: true,
                            confirmButtonText: "Đồng ý",
                            cancelButtonText: "Huỷ",
                        }).then((result) => { 
                            if (result.isConfirmed){
                                Swal.showLoading();
                                // gọi api đặt lại mật khẩu mặc định cho tài khoản của người dùng 
                                $.ajax({
                                    type: "PUT",
                                    url: "/api/users/reset-password/" + userId ,
                                    headers: utils.defaultHeaders(),
                                    success: function (res) {
                                        Swal.close();
                                        if (res.code == 1000) {
                                            Toast.fire({
                                                icon: "success",
                                                title: "Đã đặt lại mật khẩu cho tài khoản",
                                            });
                                            $("#modal-id").modal("hide");
                                        } else {
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
                    });
                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Không thể lấy thông tin tài khoản của người dùng<br>" + res.message,
                    });  
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                var err = utils.handleAjaxError(xhr);
                    Toast.fire({
                        icon: "error",
                        title: err.message
                    });
            }
        });
    }
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn người dùng để cập nhật!",
        });
    }
});


// Nhấn nút "Vô hiệu hoá" 
$("#btn-disable-user").on("click", async function () {
    if (selectedData) {
        var userId = selectedData.id; // Lấy ID của tài khoản
        var username = selectedData.username;

        // Kiểm tra nếu tài khoản đang hoạt động (status = 1)
        if (selectedData.status === 1){
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: "Bạn sẽ vô hiệu hoá tài khoản " + username,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Huỷ"
            });

            // Nếu người dùng không xác nhận, dừng việc xử lý
            if (!result.isConfirmed) {
                return;
            }
            Swal.showLoading();
            // Thực hiện vô hiệu hoá tài khoản 
            await $.ajax({
                type: "PUT",
                url: "/api/users/disable/" + userId,
                headers: utils.defaultHeaders(),
                success: async function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        await loadUserData(); // Tải lại danh sách tài khoản
                        Toast.fire({
                            icon: "success",
                            title: "Đã vô hiệu hoá tài khoản",
                        });
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.close();
                    var err = utils.handleAjaxError(xhr);
                    Toast.fire({
                        icon: "error",
                        title: err.message
                    });
                }
            });
        } else {
            Toast.fire({
                icon: "error",
                title: "Tài khoản đã bị vô hiệu hoá trước đó!",
            });
        }
    }
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn tài khoản để vô hiệu hoá!",
        });
    }
});