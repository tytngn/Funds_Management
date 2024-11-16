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
var fundOption = [];

var userRole;

var startDate;
var endDate;

$(document).ready(async function () {
    await setData();

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

    var urlFund = "/api/funds/by-treasurer";
    if (userRole === 'ADMIN'){
        urlFund = "/api/funds/active";
    }
    // Gọi api để lấy tên quỹ và nạp dữ liệu vào mảng fundOption
    $.ajax({
        type: "GET",
        url: urlFund,
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
    $("#btn-view-fund-permission").on("click", async function () {    
        await loadFundPermissionData();
    });


    // Bảng phân quyền giao dịch quỹ        
    dataTable = $('#fund-permission-table').DataTable({
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

        columns: [
            { data: "number", className: "text-center" },
            { data: "fund",
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Mô tả: ${row.description} <br>
                            </p>
                        </details>`;
                } 
            },
            { data: "trader", 
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
            { data: "grantedDate",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatDate(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
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
    // Đối với Quản trị viên
    if (roles.includes('ADMIN')) {
        userRole = "ADMIN";
    } 
    
    console.log(userRole);
}


// Gọi api lấy dữ liệu danh sách các quỹ
async function loadFundPermissionData() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ

    var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
    var departmentId = ''; 
    var userId = ''; 
    var status = '';

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
                title: "Vui lòng chọn thời gian",
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
    else if (filter === 'individual') {
        departmentId = $('#department-select').val() || ''; // Phòng ban
        userId = $('#individual-select').val() || ''; // Cá nhân 
        if (userId === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn cá nhân!",
            });
            return;
        }
    }

    var urlFundPermision = "/api/fund-permissions/filter/by-treasurer?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId;
    if (userRole === 'ADMIN'){
        urlFundPermision = "/api/fund-permissions/filter?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId;
    }
    // Gọi API với AJAX để lấy dữ liệu theo quỹ, loại giao dịch và khoảng thời gian
    await $.ajax({
        url: urlFundPermision,
        type: "GET",
        headers: utils.defaultHeaders(),
        success: function(res) {
            if (res.code == 1000) {                
                var data = [];
                var counter = 1;
                res.result.forEach(function (fundPermission) {
                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        fund: fundPermission.fund.fundName,
                        description: fundPermission.fund.description,
                        trader: fundPermission.user.fullname,
                        department: fundPermission.user.department.name,
                        contribute: fundPermission.canContribute,
                        grantedDate: fundPermission.grantedDate,
                        id: fundPermission.id, // ID của fundPermission 
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
}


function clearFilter () {
    // Clear lựa chọn của select
    $('#status-select').val(null).trigger('change');
    $('#department-select').val(null).trigger('change');
    $('#individual-select').val(null).trigger('change');

    startDate = null;
    endDate = null;
}


// Bắt sự kiện khi chọn dòng
$('#fund-permission-table tbody').on('click', 'tr', function () {
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
$("#fund-permission-search-input").on("keyup", function () {
    dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới" để thêm người đóng góp vào quỹ
$("#btn-add-fund-permission").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Thêm thành viên đóng góp quỹ");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-fund">Tên quỹ</label>
            <select class="form-control" id="modal-fund" style="width: 100%;" data-placeholder="Chọn quỹ"></select>
        </div>

        <div class="form-group">
            <label for="modal-department">Phòng ban</label>
            <select class="form-control" id="modal-department" style="width: 100%;" data-placeholder="Chọn phòng ban"></select>
        </div>

        <div class="form-group">
            <label for="modal-users">Thành viên</label>
            <select class="form-control" id="modal-users" style="width: 100%;" multiple="multiple" data-placeholder="Tất cả thành viên"></select>
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

    $('#modal-department').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    $('#modal-users').select2({
        allowClear: true,
        // theme: "bootstrap",
        closeOnSelect: false,
        width: '100%'
    });

    $("#modal-id").modal("show");

    // Gọi api để lấy phòng ban và nhân viên ở phòng ban đó
    $.ajax({
        type: "GET",
        url: "/api/departments",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let departments = res.result;
                let departmentDropdown = $("#modal-department");
                let userDropdown = $("#modal-users");

                // Thêm các phòng ban vào dropdown
                departments.forEach(function(department) {
                    departmentDropdown.append(`
                        <option value="${department.id}">${department.name}</option>
                    `);              
                });
                departmentDropdown.val("").trigger('change');

                // Gắn sự kiện khi chọn phòng ban
                departmentDropdown.on("change", function(){
                    let selectedDepartmentId = $(this).val();

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

    // Lưu thông tin phân quyền giao dịch quỹ
    $("#modal-submit-btn").click(function () {
        // Lấy giá trị của fundId
        let fundId = $('#modal-fund').val();

        // Lấy phòng ban
        let deparmentId = $('#modal-department').val();

        // Lấy danh sách các user đã chọn
        let selectedUsers = $('#modal-users').val().length!==0 ? $('#modal-users').val() : ($('#modal-users option').map(function() {
            return $(this).val();
        }).get());

        if (!deparmentId) {
            Toast.fire({
                icon: 'error',
                title: 'Vui lòng chọn phòng ban!',
            });
            return;
        }
        Swal.showLoading();
        $.ajax({
            type: "POST",
            url: "/api/fund-permissions",
            headers: utils.defaultHeaders(),
            data: JSON.stringify({
                userId: selectedUsers,
                fundId: fundId,
                canContribute: true,
            }),
            success: async function (res) {
                Swal.close();
                if(res.code==1000){
                    if ($('#fund-select').val() !== null || $('#filter-type-select').val() !== null){
                        await loadFundPermissionData();
                    }
                    Toast.fire({
                        icon: "success",
                        title: "Đã cấp quyền thành công!",
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
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    });

});


// Nhấn nút "Thu hồi" để thu hồi quyền giao dịch quỹ của người dùng
$("#btn-revoke-fund-permission").on("click", function () {
    if(selectedData){
        var fundPermissionId = selectedData.id; // Lấy ID của fund permission

        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ thu hồi quyền đóng góp quỹ của người dùng!",
            icon: "warning",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Huỷ",
        }).then((result) => { 
            if (result.isConfirmed){
                Swal.showLoading();
                // gọi api thu hồi quyền của người dùng 
                $.ajax({
                    type: "DELETE",
                    url: "/api/fund-permissions/" + fundPermissionId,
                    headers: utils.defaultHeaders(),
                    success: async function (res) {
                        Swal.close();
                        if (res.code == 1000) {
                            if ($('#fund-select').val() !== null || $('#filter-type-select').val() !== null){
                                await loadFundPermissionData();
                            }
                            Toast.fire({
                                icon: "success",
                                title: "Đã thu hồi thành công!",
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
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn người dùng để thực hiện!",
        });
    }
});