import * as utils from "/js/pages/utils.js";

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable; // fund-table
var fundPermissionTable; // fund-permission-table
let selectedData; // Biến lưu dữ liệu quỹ đã chọn
let selectedUser;

$(document).ready(function () {
    utils.introspect();
    // token = utils.getCookie('authToken');
    utils.setAjax();

    dataTable = $("#fund-table").DataTable({
        fixedHeader: true,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        searching: false,
        ordering: true,
        lengthChange: true,
        responsive: true,
        // Gọi AJAX đến server để lấy dữ liệu
        ajax: {
            url: "/api/funds", // Đường dẫn API
            type: "GET",
            dataType: "json",
            dataSrc: function (res) {
                if (res.code == 1000) {
                    console.log("success");
                    
                    var data = [];
                    var counter = 1;
                    res.result.forEach(function (fund) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            fundName: fund.fundName, 
                            balance: fund.balance, 
                            description: fund.description,
                            manager: fund.user.fullname,
                            createDate: formatDate(fund.createDate),
                            status: fund.status,
                            id: fund.id, // ID của fund 
                        });
                    });
                
                    return data; // Trả về dữ liệu đã được xử lý
                } else {
                    Toast.fire({
                        icon: "error",
                        title: res.message || "Error in fetching data",
                    });
                }
            },
            error: function(xhr, status, error){
                utils.handleAjaxError(xhr);
            },
        },
        columnDefs: [
            {
              targets: '_all', // Áp dụng cho tất cả các cột
              className: 'text-center align-middle' // Căn giữa nội dung của tất cả các cột
            }
        ],
        columns: [
            { data: "number" },
            { data: "fundName" },
            { data: "balance" },
            { data: "manager" },
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
        order: [[5, "asc"]], // Cột thứ 6 (createDate) sắp xếp tăng dần
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api
              .column(0, { page: "current" })
              .nodes()
              .each(function (cell, i) {
                cell.innerHTML = start + i + 1;
              });
        },
        initComplete: function() {
            $("a.paginate_button").addClass("custom-paginate");
        },
    });
});

// Bắt sự kiện khi chọn dòng ở bảng fund-table
$('#fund-table tbody').on('click', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    dataTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
    console.log(selectedData.id);
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

// Reset form
function reset_form(){
    var form = $('#modal-id')[0];
    if (form && typeof form.reset === 'function') {
        form.reset(); // Reset form nếu có
    } else {
        // Nếu không có form hoặc không hỗ trợ reset, xoá dữ liệu thủ công
        $('#modal-id').find('input, textarea, select').val('');
    }
}

// Nhấn nút "Thêm mới"
$("#btn-add-fund").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo quỹ mới");
  
    $("#modal-body").append(`
      <div class="form-group">
        <label for="modal_fund_name_input">Tên quỹ</label>
        <input type="text" class="form-control" id="modal_fund_name_input" placeholder="Nhập tên quỹ">
      </div>

      <div class="form-group">
        <label for="modal_fund_description_input">Mô tả</label>
        <textarea class="form-control" id="modal_fund_description_input" rows="4"></textarea>
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
        let ten = $("#modal_fund_name_input").val();
        let description = $("#modal_fund_description_input").val();
    
        if(ten == null || ten.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng điền tên quỹ!"
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/funds",
                contentType: "application/json",
                data: JSON.stringify({
                    fundName: ten,
                    description: description
                }),
                success: function (res) {
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm quỹ",
                            timer: 3000,
                        });
                    }
                    else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                    // Tải lại bảng chức năng
                    dataTable.ajax.reload();

                    // Reset form 
                    reset_form();

                    // Đóng modal
                    $("#modal-id").modal('hide');
                },
                error: function(xhr, status, error){
                    utils.handleAjaxError(xhr);
                },
            });
            $("#modal_id").modal("hide");
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Reset form 
        reset_form();

        // Đóng modal
        $("#modal-id").modal('hide');
    });

});

// Nhấn nút "Cập nhật"
$("#btn-update-fund").on("click", function () {
    if(selectedData){
        var fundId = selectedData.id; // Lấy ID của quỹ
        clear_modal();

        // Gọi API lấy thông tin quỹ theo fundId
        $.ajax({
            type: "GET",
            url: "/api/funds/" + fundId,
            success: function (res) {
                if (res.code === 1000) {
                    let fund = res.result;
                    
                    $("#modal-title").text("Cập nhật quỹ");
                    
                    // Hiển thị dữ liệu quỹ trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal_fund_name_input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal_fund_name_input" value="${fund.fundName}">
                            </div>

                            <div class="form-check form-check-flat form-check-primary">
                                <input id="modal_fund_status_input" type="checkbox" class="form-check-input ml-0" ${fund.status === 1 ? 'checked' : ''}>
                                <label class="form-check-label">Quỹ đang hoạt động</label>
                            </div>

                            <div class="form-group">
                                <label for="modal_fund_description_input">Mô tả</label>
                                <textarea class="form-control" id="modal_fund_description_input" rows="4">${fund.description}</textarea>
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
                        let name = $("#modal_fund_name_input").val();
                        let status = $("#modal_fund_status_input").is(":checked") ? 1 : 0;
                        let description = $("#modal_fund_description_input").val();
                    
                        if (name == null || name.trim() == "") {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng điền tên quỹ!"
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
                        await $.ajax({
                            type: "PUT",
                            url: "/api/funds?id=" + fundId,
                            contentType: "application/json",
                            data: JSON.stringify({
                                fundName: name,
                                status: status,
                                description: description
                            }),
                            success: function (res) {
                            if (res.code == 1000) {
                                Toast.fire({
                                icon: "success",
                                title: "Đã cập nhật quỹ",
                                });
                            } else {
                                Toast.fire({
                                    icon: "error",
                                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                                });
                            }
                            // Tải lại bảng chức năng
                            dataTable.ajax.reload();
                            },
                            error: function(xhr, status, error){
                                utils.handleAjaxError(xhr); // Gọi hàm từ util.js
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
                utils.handleAjaxError(xhr);
            }
        });
    }
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn quỹ để cập nhật!",
        });
    }
});


// Bắt sự kiện khi nháy đúp chuột vào dòng
$('#fund-table tbody').off('dblclick', 'tr').on('dblclick', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    dataTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    let selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn

    if (selectedData){
        $("#user-fund-wrapper").prop("hidden", false);
        $("#fund-wrapper").prop("hidden", true);

        // Cập nhật tên quỹ và mô tả
        $("#title-fund").text(selectedData.fundName);
        $("#description-fund").text("Mô tả: " + selectedData.description);


        // Gọi hàm showDataTable và truyền dữ liệu dòng đã chọn
        showDataTable(selectedData);
    }else {
        Toast.fire({
            icon: "error",
            title: res.message || "Không tìm thấy dữ liệu của quỹ đã chọn",
        });
    }

});

// Hàm hiển thị dataTable User: lấy tất cả người dùng được phép giao dịch với quỹ đó
function showDataTable(fund) {

    // Kiểm tra nếu bảng đã được khởi tạo trước đó, hãy hủy nó
    if ($.fn.DataTable.isDataTable('#fund-permission-table')) {
        $('#fund-permission-table').DataTable().clear().destroy();
    }

    // Dữ liệu trong bảng
    fundPermissionTable = $("#fund-permission-table").DataTable({
        fixedHeader: true,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        searching: false,
        ordering: true,
        lengthChange: true,
        responsive: true,
        // scrollX: 50,
        
        // Gọi AJAX đến server để lấy dữ liệu
        ajax: {
            url: "/api/fund-permissions?fundId=" + fund.id, // Đường dẫn API
            type: "GET",
            dataType: "json",
            dataSrc: function (res) {
                if (res.code == 1000) {
                    console.log("success");
                    // console.table(res.result);

                    var dataSet = [];
                    var stt = 1;

                    res.result.forEach(function (fundPermission){
                        dataSet.push({
                            number: stt++,
                            id: fundPermission.id,
                            fullname: fundPermission.user.fullname,
                            email: fundPermission.user.email,
                            department: fundPermission.user.department.name,
                            canContribute: fundPermission.canContribute,
                            canWithdraw: fundPermission.canWithdraw,
                        });
                    });
                    return dataSet;
                } else {
                    Toast.fire({
                        icon: "error",
                        title: res.message || "Error in fetching data",
                    });
                }
            },
        },

        columnDefs: [
            {
              targets: '_all', // Áp dụng cho tất cả các cột
              className: 'text-center align-middle' // Căn giữa nội dung của tất cả các cột
            }
        ],
        columns: [
            { data: "number" },
            { data: "fullname" },
            { data: "email" },
            { data: "department" },
            { 
                data: "canContribute",
                orderable: true, // Cho phép sắp xếp dựa trên cột này
                searchable: true, // Cho phép tìm kiếm dựa trên cột này
                render: function (data, type, row) {
                    var statusClass = data === true ? 'btn-inverse-success' : 'btn-inverse-danger';
                    var statusText = data === true ? 'Hoạt động' : 'Không hoạt động';

                    return `
                        <div class="d-flex justify-content-center align-items-center">
                            <button type="button" class="btn ${statusClass} btn-sm">${statusText}</button>
                        </div>
                    `;
                }
            },
            { 
                data: "canWithdraw",
                orderable: true, // Cho phép sắp xếp dựa trên cột này
                searchable: true, // Cho phép tìm kiếm dựa trên cột này
                render: function (data, type, row) {
                    var statusClass = data === true ? 'btn-inverse-success' : 'btn-inverse-danger';
                    var statusText = data === true ? 'Hoạt động' : 'Không hoạt động';

                    return `
                        <div class="d-flex justify-content-center align-items-center">
                            <button type="button" class="btn ${statusClass} btn-sm">${statusText}</button>
                        </div>
                    `;
                }
            },
        ],
        // order: [[5, "asc"]], // Cột thứ 6 (createDate) sắp xếp tăng dần
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api
              .column(0, { page: "current" })
              .nodes()
              .each(function (cell, i) {
                cell.innerHTML = start + i + 1;
              });
        },
        initComplete: function() {
            $("a.paginate_button").addClass("custom-paginate");
        },
    });
}

// Nhấn nút "Thêm mới" để thêm người đóng góp vào quỹ
$("#btn-add-fund-permission").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Thêm thành viên giao dịch quỹ");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal_department">Phòng ban</label>
            <select class="form-control" id="modal_department" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal_users">Thành viên</label>
            <select class="form-control" id="modal_users" style="width: 100%;" multiple="multiple"></select>
        </div>

        <div class="form-group row">
            <div class="col-sm-6">
                <div class="form-check form-check-flat form-check-primary">
                    <input id="user_fund_status_contribute" type="checkbox" class="form-check-input ml-0">
                    <label class="form-check-label">Quyền đóng góp quỹ</label>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="form-check form-check-flat form-check-primary">
                    <input id="user_fund_status_withdraw" type="checkbox" class="form-check-input ml-0">
                    <label class="form-check-label">Quyền rút quỹ</label>
                </div>
            </div>
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

    $('#modal_department').select2({
        placeholder: "Chọn phòng ban",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    $('#modal_users').select2({
        placeholder: "Chọn thành viên",
        allowClear: true,
        // theme: "bootstrap",
        closeOnSelect: false,
        width: '100%'
    });

    // Đặt lại giá trị của select-dropdown về null
    $('#modal_department').append("<option disabled selected >Chọn phòng ban</option>");

    $("#modal-id").modal("show");

    // Gọi api để lấy phòng ban và nhân viên ở phòng ban đó
    $.ajax({
        type: "GET",
        url: "/api/departments",
        success: function (res) {
            if (res.code === 1000) {
                let departments = res.result;
                let departmentDropdown = $("#modal_department");
                let userDropdown = $("#modal_users");

                // Thêm các phòng ban vào dropdown
                departments.forEach(function(department) {
                    departmentDropdown.append(`
                        <option value="${department.id}">${department.name}</option>
                    `);              
                });
                
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
                    } else {
                        // Nếu không có thành viên nào
                        userDropdown.append(`
                            <option value="">Không có thành viên</option>
                        `);
                    }
                    userDropdown.select2({
                        placeholder: "Chọn thành viên",
                        allowClear: true,
                        // theme: "bootstrap",
                        closeOnSelect: false,
                    });
                });

            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách phòng ban<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            utils.handleAjaxError(xhr);
        }
    });

    // Lưu thông tin quỹ
    $("#modal-submit-btn").click(function () {
        // Lấy giá trị của fundId
        let fundId = selectedData.id;

        // Lấy danh sách các user đã chọn
        let selectedUsers = $('#modal_users').val();

        // Lấy giá trị checkbox canContribute và canWithdraw
        let canContribute = $('#user_fund_status_contribute').is(':checked');
        let canWithdraw = $('#user_fund_status_withdraw').is(':checked');

        // Kiểm tra nếu không có người dùng được chọn
        if (!selectedUsers || selectedUsers.length === 0) {
            Toast.fire({
                icon: 'error',
                title: 'Vui lòng chọn ít nhất một người dùng',
            });
            return;
        } else if (canContribute === false && canWithdraw === false){
            Toast.fire({
                icon: 'error',
                title: 'Vui lòng chọn quyền giao dịch quỹ cho người dùng',
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/fund-permissions",
                contentType: "application/json",
                data: JSON.stringify({
                    userId: selectedUsers,
                    fundId: fundId,
                    canContribute: canContribute,
                    canWithdraw: canWithdraw,

                }),
                success: function (res) {
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã cấp quyền",
                            timer: 3000,
                        });
                    }
                    else {
                        Toast.fire({
                            icon: "error",
                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                        });
                    }
                    // Tải lại bảng chức năng
                    fundPermissionTable.ajax.reload();

                    // Reset form 
                    reset_form();

                    // Đóng modal
                    $("#modal-id").modal('hide');
                },
                error: function(xhr, status, error){
                    utils.handleAjaxError(xhr);
                },
            });
            $("#modal_id").modal("hide");
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Reset form 
        reset_form();

        // Đóng modal
        $("#modal-id").modal('hide');
    });

});

// Bắt sự kiện khi chọn dòng ở bảng fund-permission-table
$('#fund-permission-table tbody').on('click', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    fundPermissionTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    selectedUser = fundPermissionTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
    console.log(selectedUser.id);
});

// Nhấn nút "Cập nhật" để cập nhật quyền giao dịch quỹ của người dùng
$("#btn-update-fund-permission").on("click", function () {
    if(selectedUser){
        var fundPermissionId = selectedUser.id; // Lấy ID của fund permission
        clear_modal();

        // Gọi API lấy thông tin quỹ theo fundPermissionId
        $.ajax({
            type: "GET",
            url: "/api/fund-permissions/" + fundPermissionId,
            success: function (res) {
                if (res.code === 1000) {
                    let fundPermission = res.result;
                    
                    $("#modal-title").text("Cập nhật phân quyền giao dịch quỹ");
                    
                    // Hiển thị dữ liệu quỹ trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal_fund_name_input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal_fund_name_input" value="${fundPermission.fund.fundName}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_fullname_input">Người giao dịch</label>
                                <input type="text" class="form-control" id="modal_fullname_input" value="${fundPermission.user.fullname}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_email_input">Email</label>
                                <input type="text" class="form-control" id="modal_email_input" value="${fundPermission.user.email}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_deparment_input">Phòng ban</label>
                                <input type="text" class="form-control" id="modal_deparment_input" value="${fundPermission.user.department.name}" readonly>
                            </div>

                            <div class="form-group row">
                                <div class="col-sm-6">
                                    <div class="form-check form-check-flat form-check-primary">
                                        <input id="status_contribute" type="checkbox" class="form-check-input ml-0" ${fundPermission.canContribute === true ? 'checked' : ''}>
                                        <label class="form-check-label">Quyền đóng góp quỹ</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="form-check form-check-flat form-check-primary">
                                        <input id="status_withdraw" type="checkbox" class="form-check-input ml-0" ${fundPermission.canWithdraw === true ? 'checked' : ''}>
                                        <label class="form-check-label">Quyền rút quỹ</label>
                                    </div>
                                </div>
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

                    // Cập nhật quyền giao dịch
                    $("#modal-update-btn").click(function () {
                        let userId = fundPermission.user.id;
                        let fundId = fundPermission.fund.id;
                        let canContribute = $("#status_contribute").is(":checked") ? true : false;
                        let canWithdraw = $("#status_withdraw").is(":checked") ? true : false;
                    
                        if (canContribute == false && canWithdraw == false) {
                            Swal.fire({
                                    title: 'Bạn có chắc chắn?',
                                    text: "Bạn sẽ thu hồi quyền giao dịch quỹ của người dùng!",
                                    icon: "warning",
                                    showDenyButton: false,
                                    showCancelButton: true,
                                    confirmButtonText: "Đồng ý",
                                    cancelButtonText: "Huỷ",
                            }).then((result) => { 
                                if (result.isConfirmed){
                                    // gọi api thu hồi quyền của người dùng 
                                    $.ajax({
                                        type: "DELETE",
                                        url: "/api/fund-permissions/" + fundPermission.id,
                                        contentType: "application/json",
                                        success: function (res) {
                                            if (res.code == 1000) {
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Đã thu hồi quyền giao dịch",
                                                });
                                            } else {
                                                Toast.fire({
                                                    icon: "error",
                                                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                                                });
                                            }
                                            // Tải lại bảng chức năng
                                            fundPermissionTable.ajax.reload();
                                        },
                                        error: function(xhr, status, error){
                                            utils.handleAjaxError(xhr); // Gọi hàm từ util.js
                                        },
                                    });
                                }
                            });
                            $("#modal-id").modal("hide");
                        } else {
                            $.ajax({
                                type: "PUT",
                                url: "/api/fund-permissions?userId=" + userId + "&fundId=" + fundId + "&canContribute=" + canContribute + "&canWithdraw=" + canWithdraw,
                                contentType: "application/json",
                                success: function (res) {
                                    if (res.code == 1000) {
                                        Toast.fire({
                                            icon: "success",
                                            title: "Đã cập nhật phân quyền giao dịch",
                                        });
                                    } else {
                                        Toast.fire({
                                            icon: "error",
                                            title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                                        });
                                    }
                                    // Tải lại bảng chức năng
                                    fundPermissionTable.ajax.reload();
                                },
                                error: function(xhr, status, error){
                                    utils.handleAjaxError(xhr); // Gọi hàm từ util.js
                                },
                            });
                            $("#modal-id").modal("hide");
                        }
                    });

                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Không thể lấy thông tin phân quyền giao dịch của người dùng<br>" + res.message,
                    });  
                }
            },
            error: function (xhr, status, error) {
                utils.handleAjaxError(xhr);
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

// Nhấn nút "Thu hồi" để thu hồi quyền giao dịch quỹ của người dùng
$("#btn-revoke-fund-permission").on("click", function () {
    if(selectedUser){
        var fundPermissionId = selectedUser.id; // Lấy ID của fund permission

        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ thu hồi quyền giao dịch quỹ của người dùng!",
            icon: "warning",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Huỷ",
        }).then((result) => { 
            if (result.isConfirmed){
                // gọi api thu hồi quyền của người dùng 
                $.ajax({
                    type: "DELETE",
                    url: "/api/fund-permissions/" + fundPermissionId,
                    contentType: "application/json",
                    success: function (res) {
                        if (res.code == 1000) {
                            Toast.fire({
                                icon: "success",
                                title: "Đã thu hồi quyền giao dịch",
                            });
                        } else {
                            Toast.fire({
                                icon: "error",
                                title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                            });
                        }
                        // Tải lại bảng chức năng
                        fundPermissionTable.ajax.reload();
                    },
                    error: function(xhr, status, error){
                        utils.handleAjaxError(xhr); // Gọi hàm từ util.js
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


// Nhấn nút "Trở về"
$("#btn-back-fund").click(function (){
    $("#user-fund-wrapper").prop("hidden", true);
    $("#fund-wrapper").prop("hidden", false);
    dataTable.$('tr.selected').removeClass('selected');
});




