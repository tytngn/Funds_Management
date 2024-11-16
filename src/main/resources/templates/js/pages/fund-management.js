import * as utils from "/js/pages/services/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable; // fund-table
let selectedData; // Biến lưu dữ liệu quỹ đã chọn

var userRole;

var startDate;
var endDate;

$(document).ready(async function () {
    await setData();

    if (userRole === 'USER_MANAGER'){
        // Hiển thị button "Thêm mới"
        $('#btn-add-fund').prop("hidden", false);

        // Ẩn các tùy chọn có value là 'department' và 'treasurer'
        $('#filter-type-select option[value="department"]').remove();
        $('#filter-type-select option[value="treasurer"]').remove();
    }
    if (userRole === 'ADMIN'){
        // Hiển thị button "Thêm mới"
        $('#btn-add-fund').prop("hidden", false);
    }

    // Select 
    $('.select2').select2({
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
        $('#treasurer-div').prop("hidden", true);
        $('#treasurer-select').prop('disabled', true);

        clearFilter ();       
        
        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'time') {
            $('#trans-times-div').prop("hidden", false); // Hiển thị Date Picker
        } 
        else if (filterType === 'status') {
            $('#status-div').prop("hidden", false); // Hiển thị Select Trạng thái 
        }
        else if (filterType === 'department') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            loadDepartments();
        }
        else if (filterType === 'treasurer') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            $('#treasurer-div').prop("hidden", false); // Hiển thị Select Thủ quỹ nhưng sẽ disabled cho đến khi chọn phòng ban

            loadDepartments();
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

    // Gọi api để lấy phòng ban và nhân viên ở phòng ban đó
    $.ajax({
        type: "GET",
        url: "/api/departments",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let departments = res.result;
                let departmentDropdown = $("#department-select");
                let userDropdown = $("#treasurer-select");

                departmentDropdown.empty();
                departmentDropdown.append("<option disabled selected >Chọn phòng ban</option>");

                // Thêm các phòng ban vào dropdown
                departments.forEach(function(department) {
                    departmentDropdown.append(`
                        <option value="${department.id}">${department.name}</option>
                    `);              
                });
                
                // Gắn sự kiện khi chọn phòng ban
                departmentDropdown.on("change", function(){
                    let selectedDepartmentId = $(this).val();

                    userDropdown.prop("disabled", false);

                    // Xóa các thành viên cũ trong dropdown
                    userDropdown.empty();
                    userDropdown.append("<option disabled selected >Chọn thủ quỹ</option>");

                    // Tìm phòng ban đã chọn
                    let selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

                    // Thêm các thành viên của phòng ban đã chọn vào dropdown
                    if (selectedDepartment && selectedDepartment.users) {
                        selectedDepartment.users.forEach(function(user) {
                            userDropdown.append(`
                                <option value="${user.id}">${user.fullname}</option>
                            `);
                        });
                    } else {
                        // Nếu không có thành viên nào
                        userDropdown.append(`
                            <option value="">Không có thành viên</option>
                        `);
                    }
                    
                });
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


    // Nhấn nút "Xem"
    $("#btn-view-fund").on("click", async function () {    
        await loadFundData();
    });

    // Bảng thông tin quỹ
    dataTable = $("#fund-table").DataTable({
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
        ordering: true,
        info: true,
        lengthChange: true,
        responsive: true,
        scrollX: true,        // Đảm bảo bảng có thể cuộn ngang
        scrollCollapse: true, // Khi bảng có ít dữ liệu, không cần thêm khoảng trống
        dom: 'lrtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columns: [
            { data: "number", className: "text-center" },
            { data: "name", 
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Mô tả: ${row.description} <br>
                                ${row.updateDate? " Ngày cập nhật: " + utils.formatDate(row.updateDate) : ""}
                            </p>
                        </details>`;
                }
            },
            { data: "balance", 
                className: "text-right",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "treasurer", 
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Phòng ban: ${row.department} <br>
                            </p>
                        </details>`;
                }
            },
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
                className: "text-center",
                render: function (data, type, row) {
                    var statusClass = data === 1 ? 'btn-inverse-success' : 'btn-inverse-danger';
                    var statusText = data === 1 ? 'Hoạt động' : 'Ngừng hoạt động';

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
            if (userRole === 'USER_MANAGER') {   
                // Ẩn cột "Thủ quỹ"
                this.api().column(3).visible(false);
            }
        },
    });
});


// Hiển thị dữ liệu theo role của người dùng
async function setData() {
    const userInfo = await utils.getUserInfo(); // Lấy thông tin người dùng từ localStorage 
    if (!userInfo) {
        throw new Error("Không thể lấy thông tin người dùng");
    }
    
    const roles = userInfo.roles.map(role => role.id); // Lấy danh sách các role của user

    // Đối với Thủ quỹ
    if (roles.includes('USER_MANAGER')) {
        userRole = "USER_MANAGER";
    } 
    // Đối với Kế toán 
    if (roles.includes('ACCOUNTANT')) {
        userRole = "ACCOUNTANT";
    } 
    if (roles.includes('ADMIN')){
        userRole = "ADMIN";
    }
}


// Gọi api lấy dữ liệu danh sách các quỹ
async function loadFundData() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
    var departmentId = ''; 
    var userId = ''; 
    var status = '';

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
    else if (filter === 'treasurer') {
        departmentId = $('#department-select').val() || ''; // Phòng ban
        userId = $('#treasurer-select').val() || ''; // Thủ quỹ
        if (userId === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn thủ quỹ!",
            });
            return;
        }
    } 

    var url;
    if (userRole === 'USER_MANAGER') {
        url = "/api/funds/filter/by-treasurer?start=" + startDate + "&end=" + endDate + "&status=" + status;
    }
    else if (userRole === 'ACCOUNTANT' || userRole === "ADMIN") {
        url = "/api/funds/filter?start=" + startDate + "&end=" + endDate + "&status=" + status + "&departmentId=" + departmentId + "&userId=" + userId;
    }
    Swal.showLoading();
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    await $.ajax({
        url: url, 
        type: "GET",
        headers: utils.defaultHeaders(),
        success: function(res) {
            Swal.close();
            if (res.code == 1000) {  
                // Cập nhật giá trị totalAmount vào thẻ h3
                $('#total-amount-div').prop("hidden", false);
                document.getElementById("total-amount").innerText = utils.formatCurrency(res.result.totalAmount);

                var data = [];
                var counter = 1;
                res.result.funds.forEach(function (fund) {
                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        totalAmount: res.result.totalAmount,
                        name: fund.fundName,
                        balance: fund.balance, 
                        status: fund.status,
                        description: fund.description,
                        createDate: fund.createDate,
                        updateDate: fund.updateDate,
                        treasurer: fund.user.fullname,
                        department: fund.user.department.name,
                        id: fund.id, // ID của quỹ 
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


function clearFilter () {
    // Clear lựa chọn của select
    $('#status-select').val(null).trigger('change');
    $('#department-select').val(null).trigger('change');
    $('#treasurer-select').val(null).trigger('change');

    startDate = null;
    endDate = null;
}

// Bắt sự kiện khi chọn dòng
$('#fund-table tbody').on('click', 'tr', function () {
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
        console.log(selectedData.id);
    }
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#fund-search-input").on("keyup", function () {
    dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới"
$("#btn-add-fund").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Thêm quỹ mới");
  
    $("#modal-body").append(`
      <div class="form-group">
        <label for="modal-fund-name-input">Tên quỹ</label>
        <input type="text" class="form-control" id="modal-fund-name-input" placeholder="Nhập tên quỹ">
      </div>

      <div class="form-group">
        <label for="modal-fund-description-input">Mô tả</label>
        <textarea class="form-control" id="modal-fund-description-input" rows="10" placeholder="Nhập mô tả chi tiết: mục tiêu, phạm vi sử dụng, các điều kiện sử dụng, ..."></textarea>
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

    $("#modal-id").modal("show");


    // Lưu thông tin quỹ
    $("#modal-submit-btn").click(function () {
        let ten = $("#modal-fund-name-input").val();
        let description = $("#modal-fund-description-input").val();
    
        if(ten == null || ten.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên quỹ!"
            });
            return;
        } else {
            Swal.showLoading();
            $.ajax({
                type: "POST",
                url: "/api/funds",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    fundName: ten,
                    description: description
                }),
                success: async function (res) {
                    Swal.close();
                    if(res.code==1000){
                        await loadFundData();                    
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm quỹ mới!",
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
            $("#modal-id").modal("hide");
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    });

});


// Nhấn nút "Cập nhật"
$("#btn-update-fund").on("click", async function () {
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn quỹ để thực hiện!",
        });
        return;
    }
    if (userRole === 'ADMIN') {
        const result = await Swal.fire({
            title: "Bạn sẽ cập nhật?",
            text: "Vui lòng chọn chức năng để thực hiện!",
            icon: "info",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Cập nhật thông tin quỹ",
            denyButtonText: "Cập nhật thủ quỹ",
            cancelButtonText: "Huỷ"
        });
        if (result.isConfirmed){
            userRole = 'USER_MANAGER';
        }
        else if (result.isDenied){
            userRole = 'ACCOUNTANT';
        }
    }

    if(userRole === 'USER_MANAGER'){
        var fundId = selectedData.id; // Lấy ID của quỹ
        utils.clear_modal();
        Swal.showLoading();

        // Gọi API lấy thông tin quỹ theo fundId
        $.ajax({
            type: "GET",
            url: "/api/funds/" + fundId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let fund = res.result;
                    
                    $("#modal-title").text("Cập nhật thông tin quỹ");
                    
                    // Hiển thị dữ liệu quỹ trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-fund-name-input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal-fund-name-input" placeholder="Nhập tên quỹ" value="${fund.fundName}">
                            </div>

                            <div class="form-check form-check-flat form-check-primary">
                                <input id="modal-fund-status-input" type="checkbox" class="form-check-input ml-0" ${fund.status === 1 ? 'checked' : ''}>
                                <label class="form-check-label">Quỹ đang hoạt động</label>
                            </div>

                            <div class="form-group">
                                <label for="modal-fund-description-input">Mô tả</label>
                                <textarea class="form-control" id="modal-fund-description-input" rows="10" placeholder="Mô tả chi tiết về quỹ (mục tiêu, phạm vi sử dụng, các điều kiện sử dụng, ...">${fund.description}</textarea>
                            </div>
                        </form>
                    `);
                    
                    $("#modal-footer").append(`
                        <button type="submit" class="btn btn-primary mr-2" id="modal-update-btn">
                            <i class="fa-regular fa-floppy-disk mr-2"></i>Cập nhật
                        </button>
                        <button class="btn btn-light" id="modal-cancel-btn">
                            <i class="fa-regular fa-circle-xmark mr-2"></i>Huỷ bỏ
                        </button>
                    `);
                    
                    $("#modal-id").modal("show");

                    // Cập nhật quỹ
                    $("#modal-update-btn").click( async function () {
                        let name = $("#modal-fund-name-input").val();
                        let status = $("#modal-fund-status-input").is(":checked") ? 1 : 0;
                        let description = $("#modal-fund-description-input").val();
                    
                        if (name == null || name.trim() == "") {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng nhập tên quỹ!"
                            });
                            return;
                        } 
                        // Kiểm tra nếu cần xác nhận
                        if (status === 0 && fund.status !== status) {
                            const result = await Swal.fire({
                                title: 'Bạn có chắc chắn?',
                                text: "Bạn sẽ vô hiệu hoá " + name,
                                icon: "warning",
                                showDenyButton: false,
                                showCancelButton: true,
                                confirmButtonText: "Đồng ý",
                                cancelButtonText: "Huỷ",
                            });
                            
                            // Nếu người dùng không xác nhận, dừng việc xử lý
                            if (!result.isConfirmed) {
                                return;
                            }
                        }
                        Swal.showLoading();
                        await $.ajax({
                            type: "PUT",
                            url: "/api/funds/" + fundId,
                            headers: utils.defaultHeaders(),
                            data: JSON.stringify({
                                fundName: name,
                                status: status,
                                description: description
                            }),
                            success: async function (res) {
                                Swal.close();
                                if (res.code == 1000) {
                                    await loadFundData();  
                                    Toast.fire({
                                        icon: "success",
                                        title: "Đã cập nhật quỹ!",
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
                        $("#modal-id").modal("hide");
                    });

                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Không thể lấy thông tin quỹ<br>" + res.message,
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
    if (userRole === 'ACCOUNTANT') {
        var fundId = selectedData.id; // Lấy ID của quỹ
        utils.clear_modal();
        Swal.showLoading();

        // Gọi API lấy thông tin quỹ theo fundId
        $.ajax({
            type: "GET",
            url: "/api/funds/" + fundId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let fund = res.result;
                    
                    $("#modal-title").text("Cập nhật thủ quỹ");
                    
                    // Hiển thị dữ liệu quỹ trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-department-input">Phòng ban</label>
                                <select class="form-control select2" id="modal-department-input" style="width: 100%;" data-placeholder="Chọn phòng ban"></select>
                            </div>

                            <div class="form-group">
                                <label for="modal-user-input">Thủ quỹ</label>
                                <select class="form-control select2" id="modal-user-input" style="width: 100%;" data-placeholder="Chọn thủ quỹ"></select>
                            </div>
                        </form>
                    `);
                    
                    $("#modal-footer").append(`
                        <button type="submit" class="btn btn-primary mr-2" id="modal-update-btn">
                            <i class="fa-regular fa-floppy-disk mr-2"></i>Cập nhật
                        </button>
                        <button class="btn btn-light" id="modal-cancel-btn">
                            <i class="fa-regular fa-circle-xmark mr-2"></i>Huỷ bỏ
                        </button>
                    `);

                    // Gọi api để lấy phòng ban và nhân viên ở phòng ban đó
                    $.ajax({
                        type: "GET",
                        url: "/api/departments",
                        headers: utils.defaultHeaders(),
                        success: function (res) {
                            if (res.code === 1000) {
                                let departments = res.result;
                                let departmentDropdown = $("#modal-department-input");
                                let userDropdown = $("#modal-user-input");

                                departmentDropdown.empty();
                                departmentDropdown.append("<option disabled selected >Chọn phòng ban</option>");

                                // Thêm các phòng ban vào dropdown
                                departments.forEach(function(department) {
                                    departmentDropdown.append(`
                                        <option value="${department.id}">${department.name}</option>
                                    `);              
                                });

                                // Gắn sự kiện khi chọn phòng ban
                                departmentDropdown.on("change", function(){
                                    let selectedDepartmentId = $(this).val();

                                    userDropdown.prop("disabled", false);

                                    // Xóa các thành viên cũ trong dropdown
                                    userDropdown.empty();
                                    userDropdown.append("<option disabled selected >Chọn thủ quỹ</option>");

                                    // Tìm phòng ban đã chọn
                                    let selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

                                    // Thêm các thành viên của phòng ban đã chọn vào dropdown
                                    if (selectedDepartment && selectedDepartment.users) {
                                        selectedDepartment.users.forEach(function(user) {
                                            userDropdown.append(`
                                                <option value="${user.id}">${user.fullname}</option>
                                            `);
                                        });
                                    } else {
                                        // Nếu không có thành viên nào
                                        userDropdown.append(`
                                            <option value="">Không có thành viên</option>
                                        `);
                                    }
                                    
                                });
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

                    $('.select2').select2({
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                    });

                    $("#modal-id").modal("show");

                    // Cập nhật quỹ
                    $("#modal-update-btn").click(function () {
                        let userId = $("#modal-user-input").val();
                    
                        if (userId == null) {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng chọn thủ quỹ!"
                            });
                            return;
                        } 
                        
                        Swal.showLoading();
                        $.ajax({
                            type: "PUT",
                            url: "/api/funds/assign-treasurer/" + fundId + "/" + userId,
                            headers: utils.defaultHeaders(),
                            success: async function (res) {
                                Swal.close();
                                if (res.code == 1000) {
                                    await loadFundData();  
                                    Toast.fire({
                                        icon: "success",
                                        title: "Đã cập nhật thủ quỹ!",
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
                        $("#modal-id").modal("hide");
                    });

                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Không thể lấy thông tin quỹ<br>" + res.message,
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
    await setData();
});


// Nhấn nút "Vô hiệu hoá"
$("#btn-disable-fund").on("click", async function () {
    if (selectedData) {
        var fundId = selectedData.id; // Lấy ID của quỹ
        var name = selectedData.name;

        // Kiểm tra nếu quỹ đang hoạt động (status = 1)
        if (selectedData.status === 1){
            const result = await Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: "Bạn sẽ vô hiệu hoá " + name,
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
            // Thực hiện vô hiệu hoá quỹ 
            await $.ajax({
                type: "PUT",
                url: "/api/funds/disable/" + fundId,
                headers: utils.defaultHeaders(),
                success: async function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        await loadFundData();  
                        Toast.fire({
                            icon: "success",
                            title: "Đã vô hiệu hoá quỹ!",
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
                title: "Quỹ đã bị vô hiệu hoá trước đó!",
            });
        }
    }
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn quỹ để thực hiện!",
        });
    }
});
