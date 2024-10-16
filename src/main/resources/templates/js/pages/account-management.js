import * as utils from "/js/pages/utils.js";
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
var deparmentOption = [];
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
            loadDepartments();
        }
        else if (filterType === 'role') {
            $('#role-div').prop("hidden", false);
            loadRoles();
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
    function loadDepartments() {
        $.ajax({
            type: "GET",
            url: "/api/departments",
            headers: utils.defaultHeaders(),
            success: function (res) {
                if (res.code === 1000) {
                    let departments = res.result;
                    let departmentDropdown = $("#department-select");
                    deparmentOption = [];

                    departmentDropdown.empty();
    
                    // Thêm các phòng ban vào dropdown
                    departments.forEach(function(department) {
                        deparmentOption.push({
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
    }

    // Gọi api để lấy phòng ban 
    function loadRoles() {
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

                    // Thêm các phòng ban vào dropdown
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
            "SCB"
        ];

        var bankSelect = $('#bank-select'); // Lấy phần tử select bằng id

        // Thêm các option vào select
        $.each(banks, function(index, bank) {
            bankSelect.append('<option value="' + bank + '">' + bank + '</option>');
        });
        bankSelect.val("").trigger('change');
    }


    // Bảng phân quyền giao dịch quỹ        
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
        { data: "name", 
            render: function (data, type, row) {
                return `
                    <details>
                        <summary class="text-left">
                            <b>${data}</b>
                        </summary> <br>
                        <p class="text-left" style="white-space: normal; !important">
                            Username: ${row.username} <br>
                            Email: ${row.email} <br>
                            Số điện thoại: ${row.phone} <br>
                            Phân quyền: ${row.role} <br>
                            Ngân hàng : ${row.bankName} <br>
                            Số tài khoản: ${row.accountNumber} <br>                          
                            ${row.updateDate? " Ngày cập nhật: " + row.updateDate : ""}
                        </p>
                    </details>`;
            }
        },
        { data: "gender" },
        { data: "dob" },
        { data: "deparment" },
        { data: "createDate" },
        { 
            data: "status",
            orderable: true, // Cho phép sắp xếp dựa trên cột này
            searchable: true, // Cho phép tìm kiếm dựa trên cột này
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
        order: [[6, "asc"]], // Cột thứ 7 (status) sắp xếp tăng dần
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


// Hàm định dạng ngày tháng
function formatDate(dateString) {
  if (!dateString) return ''; // Kiểm tra giá trị null hoặc rỗng
  var date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}


// Clear modal
function clear_modal() {
  $("#modal-title").empty();
  $("#modal-body").empty();
  $("#modal-footer").empty();
}


// Bắt sự kiện khi chọn dòng ở bảng fund-table
$('#user-table tbody').on('click', 'tr', function () {
  // Xóa lựa chọn hiện tại nếu có
  dataTable.$('tr.selected').removeClass('selected');
  $(this).addClass('selected'); // Đánh dấu dòng đã chọn
  selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
  console.log(selectedData.id);
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#user-search-input").on("keyup", function () {
  dataTable.search(this.value).draw();
});