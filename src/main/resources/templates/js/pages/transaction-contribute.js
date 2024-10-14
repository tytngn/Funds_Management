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
var fundOption = [];
var transTypeOption = [];

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

        // Reset class về mặc định trước
        $('.form-group .col-sm-2').removeClass('col-sm-2').addClass('col-sm-3');

        // Ẩn tất cả các trường trước
        $('#trans-times-div').prop("hidden", true);
        $('#status-div').prop("hidden", true);
        $('#department-div').prop("hidden", true);
        $('#individual-div').prop("hidden", true);
        $('#individual-select').prop('disabled', true);

        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'time') {
            $('#trans-times-div').prop("hidden", false); // Hiển thị Date Range Picker
        } 
        else if (filterType === 'status') {
            $('#status-div').prop("hidden", false); // Hiển thị Select Trạng thái 
        }
        else if (filterType === 'department') {
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            loadDepartments();
        }
        else if (filterType === 'individual') {
            // Thay đổi class từ col-sm-3 sang col-sm-2 chỉ cho các thẻ không phải là "Tên quỹ" và "Loại giao dịch"
            $('.form-group .col-sm-3').not('#fund-select-div, #trans-type-select-div').removeClass('col-sm-3').addClass('col-sm-2');

            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            $('#department-select').append("<option disabled selected >Chọn phòng ban</option>");
            $('#individual-div').prop("hidden", false); // Hiển thị Select Cá Nhân nhưng sẽ disabled cho đến khi chọn phòng ban
            $('#individual-select').append("<option disabled selected >Chọn cá nhân</option>");

            loadDepartments();
        }
    });

    // Date Range Picker
    $('input[name="datefilter"]').daterangepicker({
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
    // Nút "Áp dụng" trong Date Range Picker
    $('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
        // Hiển thị lên ô input
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

        startDate = picker.startDate.format('YYYY-MM-DD');
        endDate = picker.endDate.format('YYYY-MM-DD');
    });
    // Nút "Huỷ" trong Date Range Picker
    $('input[name="datefilter"]').on('cancel.daterangepicker', function(ev, picker) {
        startDate = '';
        endDate = '';
        $(this).val('');
    });

    // Gọi api để lấy tên quỹ và Nạp dữ liệu lên mảng fundOption
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

    // Gọi api để lấy loại giao dịch và Nạp dữ liệu lên mảng transTypeOption
    $.ajax({
        type: "GET",
        url: "/api/transactionTypes/contribute",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let transactionTypes = res.result;
                let transactionTypeDropdown = $("#trans-type-select");
                transTypeOption = [];
                
                // Thêm các loại giao dịch vào dropdown
                transactionTypes.forEach(function(transactionType) {
                    transTypeOption.push({
                        id: transactionType.id,
                        text: transactionType.name,
                    })
                    transactionTypeDropdown.append($('<option>', {
                        value: transactionType.id, // Gán giá trị cho thuộc tính value
                        text: transactionType.name // Gán văn bản hiển thị
                    }));
                });
                transactionTypeDropdown.val("").trigger('change');
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách loại giao dịch<br>" + res.message,
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
    function loadDepartments() {
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
    }


    // Nhấn nút "Xem"
    $("#btn-view-contribute").on("click", function () {    
        // Nếu không có giá trị thì gán ''
        startDate = startDate || ''; 
        endDate = endDate || ''; 

        var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ
        var transTypeId = $('#trans-type-select').val() || ''; // Lấy giá trị của select loại giao dịch

        var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
        var departmentId = ''; 
        var userId = ''; 
        var status = '';

        // Kiểm tra nếu không chọn bộ lọc nào và không chọn quỹ, loại giao dịch
        if (!filter && fundId == '' && transTypeId == '') {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn quỹ hoặc loại giao dịch!",
            });
            return;
        }

        if (filter === 'time') {
            // Nếu chọn bộ lọc "theo thời gian" nhưng không chọn quỹ và loại giao dịch
            if (fundId == '' && transTypeId == ''){
                Toast.fire({
                    icon: "warning",
                    title: "Vui lòng chọn quỹ hoặc loại giao dịch!",
                });
                return;
            }
        } 
        else if (filter === 'status') {
            status = $('#status-select').val() || ''; // Trạng thái
        } 
        else if (filter === 'department') {
            departmentId = $('#department-select').val() || ''; // Phòng ban
        } 
        else if (filter === 'individual') {
            departmentId = $('#department-select').val() || ''; // Phòng ban
            userId = $('#individual-select').val() || ''; // Cá nhân 
        } 

        console.log("quỹ " + fundId);
        console.log("loại " + transTypeId);
        console.log("bắt đầu " + startDate);
        console.log("kết thúc " + endDate );
        console.log("phòng ban " + departmentId);
        console.log("cá nhân " + userId);
        console.log("trạng thái " + status);
        
       
        // Gọi API với AJAX để lấy dữ liệu theo quỹ, loại giao dịch và khoảng thời gian
        $.ajax({
            url: "/api/fundTransactions/contribution/filter?fundId=" + fundId + "&transTypeId=" + transTypeId + "&startDate=" + startDate + "&endDate=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId + "&status=" + status, // Đường dẫn API của bạn
            type: "GET",
            headers: utils.defaultHeaders(),
            success: function(res) {
                if (res.code == 1000) {
                    console.log("success");
                    
                    var data = [];
                    var counter = 1;
                    res.result.forEach(function (transaction) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            amount: transaction.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), 
                            description: transaction.description,
                            status: transaction.status,
                            transDate: formatDate(transaction.transDate),
                            trader: transaction.user.fullname,
                            department: transaction.user.department.name,
                            fund: transaction.fund.fundName,
                            transactionType: transaction.transactionType.name,
                            id: transaction.id, // ID của transaction 
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

    // Bảng đóng góp quỹ        
    dataTable = $('#transaction-contribute-table').DataTable({
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
        dom: 'lrtip',  // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columnDefs: [
            {
                targets: '_all', // Áp dụng cho tất cả các cột
                className: 'text-center align-middle' // Căn giữa nội dung của tất cả các cột
            },
            {
                targets: 1, // Cột tên quỹ
                className: 'text-left align-middle', // Căn lề trái nội dung của cột tên quỹ
            }
        ],

        columns: [
            { data: "number" },
            { data: "fund" },
            { data: "transactionType" },
            { data: "amount" },
            { data: "trader" },
            { data: "department" },
            { data: "transDate" },
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
                            statusClass = 'btn-inverse-warning';
                            statusText = 'Chờ duyệt';
                            break;
                        case 2:
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
        order: [[6, "asc"]], // Cột thứ 7 (transDate) sắp xếp tăng dần
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


// Bắt sự kiện khi chọn dòng
$('#transaction-contribute-table tbody').on('click', 'tr', function () {
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
    
    // Lấy thông tin giờ, phút, giây
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    
    // Định dạng ngày tháng năm
    var datePart = date.toLocaleDateString('vi-VN');
    
    // Kết hợp ngày tháng năm và giờ phút giây
    return `${hours}:${minutes}:${seconds} ${datePart}`;
}


// Hàm xử lý kiểu dữ liệu của số tiền trước khi gửi form (chuyển thành kiểu double)
function getRawValue(selector) {
    const formattedValue = $(selector).val(); // Lấy giá trị từ input thông qua jQuery
    const rawValue = formattedValue.replace(/\./g, ''); // Loại bỏ dấu chấm
    return parseFloat(rawValue); // Chuyển thành số thực (double)
}    


// Clear modal
function clear_modal() {
    $("#modal-title").empty();
    $("#modal-body").empty();
    $("#modal-footer").empty();
}


// Bắt sự kiện keyup "Tìm kiếm"
$("#search-input").on("keyup", function () {
    console.log("tìm kiếm");
    dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới"
$("#btn-add-contribute").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo giao dịch đóng góp quỹ mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-fund-name">Tên quỹ</label>
            <select class="form-control" id="modal-fund-name" style="width: 100%;" data-placeholder="Chọn quỹ"></select>
        </div>

        <div class="form-group">
            <label for="modal-transaction-type">Loại giao dịch</label>
            <select class="form-control" id="modal-transaction-type" style="width: 100%;" data-placeholder="Chọn loại giao dịch"></select>
        </div>

        <div class="form-group">
            <label for="modal-transaction-amount-input">Số tiền</label>
            <div class="input-group">
                <input id="modal-transaction-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)">
                <div class="input-group-append">
                    <span class="input-group-text bg-primary text-white">₫</span>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="modal-transaction-description-input">Ghi chú</label>
            <textarea class="form-control" id="modal-transaction-description-input" rows="4"></textarea>
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

    $('#modal-fund-name').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: fundOption
    });
    $('#modal-fund-name').val("").trigger('change');

    $('#modal-transaction-type').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: transTypeOption
    });
    $('#modal-transaction-type').val("").trigger('change');


    // Hàm định dạng số tiền khi nhập
    document.getElementById('modal-transaction-amount-input').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\./g, ''); // Loại bỏ các dấu chấm hiện có
        value = parseFloat(value.replace(/[^0-9]/g, '')); // Loại bỏ các ký tự không phải số

        if (!isNaN(value)) {
        e.target.value = value.toLocaleString('vi-VN'); // Định dạng số với dấu chấm
        } else {
        e.target.value = '';
        }
    });


    $("#modal-id").modal("show");

    
    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(function () {
        let fund = $("#modal-fund-name").val();
        let transactionType = $("#modal-transaction-type").val();
        let amount = getRawValue("#modal-transaction-amount-input");
        let description = $("#modal-transaction-description-input").val();

        console.log(fund);
        console.log(transactionType);
        
    
        if(amount == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập số tiền giao dịch!"
            });
            return;
        } else if (description == null || description.trim() == ""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập lý do đóng góp quỹ!"
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/fundTransactions",
                headers: utils.defaultHeaders(),
                // contentType: "application/json",
                data: JSON.stringify({
                    amount: amount,
                    description: description,
                    fund: fund,
                    transactionType: transactionType,
                }),
                success: function (res) {
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm giao dịch",
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
                },
            });
            $("#modal-id").modal("hide");
            $("#modal-id").on('hidden.bs.modal', function () {
                $("#btn-view-contribute").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
            });
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    });

});


// Nhấn nút "Xác nhận"
$("#btn-confirm-contribute").on("click", function () {
    if(selectedData){
        var fundTransactionId = selectedData.id; // Lấy ID của giao dịch
        clear_modal();

        // Gọi API lấy thông tin giao dịch theo fundTransactionId
        $.ajax({
            type: "GET",
            url: "/api/fundTransactions/" + fundTransactionId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                if (res.code === 1000) {
                    let fundTransaction = res.result;
                    
                    // Nếu giao dịch đã duyệt hoặc đã từ chối 
                    if (fundTransaction.status === 0 || fundTransaction.status === 2) {
                        Toast.fire({
                            icon: "error",
                            title: "Giao dịch đã được xử lý!"
                        });
                        return;
                    }

                    $("#modal-title").text("Xác nhận giao dịch");
                    
                    // Hiển thị dữ liệu quỹ trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-fund-name-input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal-fund-name-input" value="${fundTransaction.fund.fundName}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal-transaction-type">Loại giao dịch</label>
                                <input type="text" class="form-control" id="modal-transaction-type" value="${fundTransaction.transactionType.name}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal-transaction-amount">Số tiền</label>
                                <input type="text" class="form-control" id="modal-transaction-amount" value="${fundTransaction.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal-transaction-time">Thời gian giao dịch</label>
                                <input type="text" class="form-control" id="modal-transaction-time" value="${formatDate(fundTransaction.transDate)}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal-transaction-description">Mô tả</label>
                                <textarea class="form-control" id="modal-transaction-description" rows="4" readonly>${fundTransaction.description}</textarea>
                            </div>

                            <div class="form-group row">
                                <div class="col-sm-6">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input ml-0" name="modal-transaction-status" id="approve" value="approve">
                                        <label class="form-check-label">Duyệt</label>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input ml-0" name="modal-transaction-status" id="reject" value="reject">
                                        <label class="form-check-label">Từ chối</label>
                                    </div>
                                </div>

                            </div>

                        </form>
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

                    // Nhấn nút "Lưu"
                    $("#modal-submit-btn").click(function () {
                
                        // Lấy giá trị từ radio button
                        let transactionStatus = $("input[name='modal-transaction-status']:checked").val();
    
                        if (!transactionStatus) {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng chọn trạng thái duyệt hoặc từ chối!"
                            });
                            return;
                        } else {
                            let apiUrl;
                            // Xác định API dựa trên trạng thái duyệt hoặc từ chối
                            if (transactionStatus === "approve") {
                                apiUrl = `/api/fundTransactions/approve/${fundTransactionId}`;
                            } else {
                                apiUrl = `/api/fundTransactions/reject/${fundTransactionId}`;
                            }
                            $.ajax({
                                type: "PUT",
                                url: apiUrl,
                                headers: utils.defaultHeaders(),
                                // contentType: "application/json",
                                data: JSON.stringify({
                                    id: fundTransactionId
                                }),
                                success: function (res) {
                                if (res.code == 1000) {
                                    Toast.fire({
                                    icon: "success",
                                    title: "Đã xác nhận giao dịch",
                                    });
                                } else {
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
                                },
                            });
                        }
                        $("#modal-id").modal("hide");
                        $("#modal-id").on('hidden.bs.modal', function () {
                            $("#btn-view-contribute").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
                        });
                    });

                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                    icon: "error",
                    title: "Không thể lấy thông tin giao dịch<br>" + res.message,
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
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn giao dịch để thực hiện!",
        });
    }
    
});



