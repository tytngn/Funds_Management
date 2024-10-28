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
var fundOption = [];

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
        $('#individual-div').prop("hidden", true);
        $('#individual-select').prop('disabled', true);

        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'time') {
            $('#trans-times-div').prop("hidden", false); // Hiển thị Date Picker
        } 
        else if (filterType === 'status') {
            $('#status-div').prop("hidden", false); // Hiển thị Select Trạng thái 
        }
        else if (filterType === 'department') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
        }
        else if (filterType === 'individual') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            $('#individual-div').prop("hidden", false); // Hiển thị Select Cá Nhân nhưng sẽ disabled cho đến khi chọn phòng ban
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

    // Gọi api để lấy tên quỹ và nạp dữ liệu vào mảng fundOption
    $.ajax({
        type: "GET",
        url: "/api/funds/active",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let funds = res.result;
                let fundNameDropdown = $("#fund-select");
                fundOption = [];
    
                // Thêm các quỹ vào dropdown
                funds.forEach(function(fund) {
                    fundOption.push({
                        id: fund.id,
                        text: fund.fundName,
                    })
                    fundNameDropdown.append($('<option>', {
                        value: fund.id, // Gán giá trị cho thuộc tính value
                        text: fund.fundName // Gán văn bản hiển thị
                    }));
                });
                $('#fund-select').val("").trigger('change');
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách quỹ<br>" + res.message,
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

    // Gọi api để lấy phòng ban và nhân viên ở phòng ban đó
    $.ajax({
        type: "GET",
        url: "/api/departments",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let departments = res.result;
                let departmentDropdown = $("#department-select");
                let userDropdown = $("#individual-select");

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

                // Gắn sự kiện khi chọn phòng ban
                departmentDropdown.on("change", function(){
                    let selectedDepartmentId = $(this).val();

                    userDropdown.prop("disabled", false);

                    // Xóa các thành viên cũ trong dropdown
                    userDropdown.empty();

                    // Tìm phòng ban đã chọn
                    let selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

                    // Thêm các thành viên của phòng ban đã chọn vào dropdown
                    if (selectedDepartment && selectedDepartment.users) {
                        selectedDepartment.users.forEach(function(user) {
                            userDropdown.append(`
                                <option value="${user.id}">${user.fullname}</option>
                            `);
                        });
                        userDropdown.val("").trigger('change');
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
    $("#btn-view-budget-estimate").on("click", function () {    
        // Nếu không có giá trị thì gán ''
        startDate = startDate || ''; 
        endDate = endDate || ''; 

        var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ

        var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
        var status = '';
        var departmentId = ''; 
        var userId = ''; 

        // Kiểm tra nếu không chọn bộ lọc nào và không chọn quỹ
        if (!filter && fundId == '') {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn quỹ!",
            });
            return;
        }

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

        console.log("quỹ " + fundId);
        console.log("bắt đầu " + startDate);
        console.log("kết thúc " + endDate );
        console.log("phòng ban " + departmentId);
        console.log("cá nhân " + userId);
        console.log("trạng thái " + status);
       
        // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
        $.ajax({
            url: "/api/budget-estimates/filter?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&status=" + status + "&departmentId=" + departmentId + "&userId=" + userId, 
            type: "GET",
            headers: utils.defaultHeaders(),
            success: function(res) {
                if (res.code == 1000) {                    
                    var data = [];
                    var counter = 1;
                    res.result.forEach(function (budgetEstimate) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            title: budgetEstimate.title,
                            amount: utils.formatCurrency(budgetEstimate.amount), 
                            status: budgetEstimate.status,
                            description: budgetEstimate.description,
                            fundName: budgetEstimate.fundName,
                            createdDate: utils.formatDate(budgetEstimate.createdDate),
                            updatedDate: utils.formatDate(budgetEstimate.updatedDate),
                            user: budgetEstimate.user.fullname,
                            department: budgetEstimate.user.department.name,
                            id: budgetEstimate.id, // ID của dự trù kinh phí 
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
    });


    // Bảng phân quyền giao dịch quỹ        
    dataTable = $('#budget-estimate-table').DataTable({
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
                targets: 1, // Cột tên dự trù kinh phí
                className: 'text-left align-middle', // Căn lề trái nội dung của cột tên quỹ
            }
        ],

        columns: [
            { data: "number" },
            { data: "title",
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Mô tả: ${row.description} <br>
                                Ngày cập nhật: ${row.updatedDate} <br>
                            </p>
                        </details>`;
                } 
            },
            { data: "fundName" },
            { data: "user", 
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
            { data: "amount" },
            { data: "createdDate" },
            { 
                data: "status",
                orderable: true, // Cho phép sắp xếp dựa trên cột này
                searchable: true, // Cho phép tìm kiếm dựa trên cột này
                render: function (data, type, row) {
                    var statusClass = '';
                    var statusText = '';
                    // Xử lý các trạng thái
                    switch (data) {
                        case 0:
                            statusClass = 'btn-inverse-danger';
                            statusText = 'Từ chối';
                            break;
                        case 1:
                            statusClass = 'btn-inverse-secondary';
                            statusText = 'Chưa xử lý';
                            break;
                        case 2:
                            statusClass = 'btn-inverse-warning';
                            statusText = 'Chờ duyệt';
                            break;
                        case 3:
                            statusClass = 'btn-inverse-success';
                            statusText = 'Đã duyệt';
                            break;
                    }

                    return `
                        <div class="d-flex justify-content-center align-items-center">
                            <button type="button" class="btn ${statusClass} btn-sm">${statusText}</button>
                        </div>
                    `;
                }
            },
        ],
        order: [[2, "asc"]], // Cột thứ 3 (trader) sắp xếp tăng dần
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


// Nhấn nút "Thêm mới"
$("#btn-add-budget-estimate").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Tạo dự trù thanh toán mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-title-input">Tên dự trù kinh phí</label>
            <input type="text" class="form-control" id="modal-title-input" placeholder="Nhập tên dự trù kinh phí">
        </div>

        <div class="form-group">
            <label for="modal-fund">Tên quỹ</label>
            <select class="form-control" id="modal-fund" style="width: 100%;" data-placeholder="Chọn quỹ"></select>
        </div>

        <div class="form-group">
            <label for="modal-description-input">Mô tả</label>
            <textarea class="form-control" id="modal-description-input" rows="4" placeholder="Nhập mô tả chi tiết: mục tiêu sử dụng, phạm vi áp dụng, đối tượng áp dụng, ..."></textarea>
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

    $('#modal-fund').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: fundOption
    });
    // Đặt lại giá trị của select-dropdown về null
    $('#modal-fund').val("").trigger('change');

    $("#modal-id").modal("show");


    // Lưu thông tin quỹ
    $("#modal-submit-btn").click(function () {
        let title = $("#modal-title-input").val();
        let fund = $("#modal-fund").val();
        let description = $("#modal-description-input").val();
    
        if(title == null || title.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên dự trù kinh phí!"
            });
            return;
        } 
        else {
            $.ajax({
                type: "POST",
                url: "/api/budget-estimates",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    title: title,
                    description: description,
                    fund: fund
                }),
                beforeSend: function () {
                    Swal.showLoading();
                },
                success: function (res) {
                    Swal.close();
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm dự trù kinh phí",
                            timer: 3000,
                        });
                        $("#modal-id").on('hidden.bs.modal', function () {
                            $("#btn-view-budget-estimate").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
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