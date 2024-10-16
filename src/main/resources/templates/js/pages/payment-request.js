import * as utils from "/js/pages/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable; // bảng đề nghị thanh toán
var invoicesTable; // bảng hoá đơn
let selectedData; // Biến lưu dữ liệu đã chọn
let selectedInvoice; // Biến lưu hoá đơn đã chọn

var PaymentCategoryOption = []; // loại thanh toán

var startDate;
var endDate;
var issuedTime; // thời gian phát hành hoá đơn

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
            $('#department-div').prop("hidden", false); // Hiển thị Select Phòng Ban
            $('#individual-div').prop("hidden", false); // Hiển thị Select Cá Nhân nhưng sẽ disabled cho đến khi chọn phòng ban

            loadDepartments();
        }
    });

    // Date Range Picker
    $('input[name="datefilter"]').daterangepicker({
        autoUpdateInput: false,
        showDropdowns: true,
        linkedCalendars: false,
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

    // Gọi api để lấy loại thanh toán và Nạp dữ liệu lên mảng PaymentCategoryOption
    $.ajax({
        type: "GET",
        url: "/api/paymentCategory",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let paymentCategory = res.result;
                let paymentCategoryDropdown = $("#payment-category-select");
                PaymentCategoryOption = [];
                
                // Thêm các loại giao dịch vào dropdown
                paymentCategory.forEach(function(paymentType) {
                    PaymentCategoryOption.push({
                        id: paymentType.id,
                        text: paymentType.name,
                    })
                    paymentCategoryDropdown.append($('<option>', {
                        value: paymentType.id, // Gán giá trị cho thuộc tính value
                        text: paymentType.name // Gán văn bản hiển thị
                    }));
                });
                paymentCategoryDropdown.val("").trigger('change');
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
    $("#btn-view-payment-request").on("click", function () {    
        // Nếu không có giá trị thì gán ''
        startDate = startDate || ''; 
        endDate = endDate || ''; 

        var categoryId = $('#payment-category-select').val() || ''; // Lấy giá trị của select loại thanh toán

        var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
        var status = '';
        var departmentId = ''; 
        var userId = ''; 

        // Kiểm tra nếu không chọn bộ lọc nào hoặc chọn bộ lọc "theo thời gian" và không chọn danh mục thanh toán
        if ((!filter || filter === 'time') && categoryId == '') {
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn danh mục thanh toán!",
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
            if(status === ''){
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

        // console.log("loại " + categoryId);
        // console.log("bắt đầu " + startDate);
        // console.log("kết thúc " + endDate );
        // console.log("phòng ban " + departmentId);
        // console.log("cá nhân " + userId);
        // console.log("trạng thái " + status);
        
       
        // Gọi API với AJAX để lấy dữ liệu theo quỹ, loại giao dịch và khoảng thời gian
        $.ajax({
            url: "/api/paymentRequests/filter?categoryId=" + categoryId + "&start=" + startDate + "&end=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId + "&status=" + status, // Đường dẫn API của bạn
            type: "GET",
            headers: utils.defaultHeaders(),
            success: function(res) {
                if (res.code == 1000) {
                    
                    var data = [];
                    var counter = 1;
                    res.result.forEach(function (paymentReq) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            amount: paymentReq.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), 
                            description: paymentReq.description,
                            status: paymentReq.status,
                            createdDate: formatDate(paymentReq.createDate),
                            updatedDate: formatDate(paymentReq.updatedDate),
                            trader: paymentReq.user.fullname,
                            email: paymentReq.user.email,
                            phone: paymentReq.user.phone,
                            department: paymentReq.user.department.name,
                            category: paymentReq.category.name,
                            id: paymentReq.id, // ID của transaction 
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


    // Bảng đề nghị thanh toán      
    dataTable = $('#payment-request-table').DataTable({
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
                targets: 1, // Cột loại thanh toán
                className: 'text-left align-middle', // Căn lề trái nội dung của cột tên quỹ
            }
        ],

        columns: [
            { data: "number" },
            { data: "category" },
            { data: "department" },
            { data: "trader",
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Email: ${row.email} <br>
                                ${row.phone? " Số điện thoại: " + row.phone : ""}                                
                            </p>
                        </details>`;
                }
            },
            { data: "amount" },
            { data: "createdDate" },
            { data: "updatedDate" },
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
        order: [[3, "asc"]], // Cột thứ 4 (trader) sắp xếp tăng dần
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


// Bắt sự kiện khi chọn dòng của bảng danh sách đề nghị thanh toán
$('#payment-request-table tbody').on('click', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    dataTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
    console.log(selectedData.id);
});


// Bắt sự kiện khi nháy đúp chuột vào dòng của bảng danh sách đề nghị thanh toán
$('#payment-request-table tbody').off('dblclick', 'tr').on('dblclick', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    dataTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    selectedData = dataTable.row(this).data(); // Lưu dữ liệu dòng đã chọn

    if (selectedData){
        $("#invoices-wrapper").prop("hidden", false);
        $("#payment-wrapper").prop("hidden", true);

        // Cập nhật loại thanh toán và mô tả
        $("#title-payment-request").text(selectedData.category);
        $("#description-payment-request").text("Mô tả: " + selectedData.description);

        // Gọi hàm showDataTable và truyền dữ liệu dòng đã chọn
        showDataTable(selectedData.id);        
    }else {
        Toast.fire({
            icon: "error",
            title: res.message || "Không tìm thấy dữ liệu của quỹ đã chọn",
        });
    }

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


// Bắt sự kiện keyup "Tìm kiếm" để tìm kiếm đề nghị thanh toán
$("#payment-search-input").on("keyup", function () {
    dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới" để thêm đề nghị thanh toán
$("#btn-add-payment-request").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo đề nghị thanh toán");
  
    $("#modal-body").append(`

        <div class="form-group">
            <label for="modal-payment-category">Danh mục thanh toán</label>
            <select class="form-control" id="modal-payment-category" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal-payment-request-description-input">Mô tả</label>
            <textarea class="form-control" id="modal-payment-request-description-input" rows="4"></textarea>
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

    $('#modal-payment-category').select2({
        placeholder: "Chọn danh mục thanh toán",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: PaymentCategoryOption
    });
    // Đặt lại giá trị của select-dropdown về null
    $('#modal-payment-category').val("").trigger('change');


    $("#modal-id").modal("show");

    
    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(function () {
        let category = $("#modal-payment-category").val();
        let description = $("#modal-payment-request-description-input").val();
    
        if(category == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng chọn danh mục thanh toán!"
            });
            return;
        } else if (description == null || description.trim() == ""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập mô tả cho đề nghị thanh toán!"
            });
            return;
        } else {
            $.ajax({
                type: "POST",
                url: "/api/paymentRequests",
                headers: utils.defaultHeaders(),
                // contentType: "application/json",
                data: JSON.stringify({
                    description: description,
                    category: category,
                }),
                success: function (res) {
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm đề nghị thanh toán!",
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
            // $("#modal-id").on('hidden.bs.modal', function () {
            //     $("#btn-view-contribute").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
            // });
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    });

});


// Hàm hiển thị dataTable Invoice: lấy tất cả hoá đơn của một đề nghị thanh toán
function showDataTable(paymentReq) {

    // Kiểm tra nếu bảng đã được khởi tạo trước đó, hãy hủy nó
    if ($.fn.DataTable.isDataTable('#invoices-table')) {
        $('#invoices-table').DataTable().clear().destroy();
    }

    // Dữ liệu trong bảng
    invoicesTable = $("#invoices-table").DataTable({
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
        
        // Gọi AJAX đến server để lấy dữ liệu
        ajax: {
            url: "/api/invoices/paymentReq/" + paymentReq, // Đường dẫn API
            type: "GET",
            dataType: "json",
            headers: utils.defaultHeaders(),
            dataSrc: function (res) {
                if (res.code == 1000) {
                    console.table(res.result);

                    var dataSet = [];
                    var stt = 1;

                    res.result.forEach(function (invoices){
                        // Xử lý hình ảnh, giả sử API trả về thuộc tính `images` là danh sách hình ảnh base64 hoặc URL
                        var proofImagesHtml = '';
                        if (invoices.images && invoices.images.length > 0) {
                            invoices.images.forEach(function (image) {
                                // Nếu hình ảnh là base64
                                // console.log(image); // Kiểm tra giá trị của image trong mỗi lần lặp
                                proofImagesHtml += `
                                    <a href="data:image/jpeg;base64,${image.image}" data-toggle="lightbox" class="proof-image" style="display:inline-block; margin: 10px;" data-gallery="example-gallery">
                                        <img src="data:image/jpeg;base64,${image.image}" style="width: 200px; height: 200px; object-fit: cover;" class="img-fluid">
                                    </a>
                                `;
                                        
                            });
                        } else {
                            proofImagesHtml = 'Không có hình ảnh minh chứng';
                        }

                        dataSet.push({
                            number: stt++,
                            id: invoices.id,
                            name: invoices.name,
                            amount: invoices.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
                            issuedDate: formatDate(invoices.issuedDate),
                            description: invoices.description,
                            createDate: formatDate(invoices.createDate),
                            updateDate: formatDate(invoices.updateDate),
                            proofImages: proofImagesHtml
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
            },
            {
                targets: 1, // Cột tên hoá đơn
                className: 'text-left align-middle', // Căn lề trái nội dung của cột tên quỹ
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
                                Mô tả: ${row.description} <br>
                                Hình ảnh minh chứng: 
                                    <button class="btn btn-link btn-fw view-image" style="color: white;" 
                                        data-images='${row.proofImages}'>
                                        Xem hình ảnh
                                    </button>
                            </p>
                        </details>`;
                }
            },
            { data: "amount" },
            { data: "issuedDate" },
            { data: "createDate" },
            { data: "updateDate" },
        ],
        order: [[1, "asc"]], // Cột thứ 2 (name) sắp xếp tăng dần

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
}


// Hàm chuyển đổi hình ảnh thành base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Mở hình ảnh lớn hơn
$(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();

    // Ẩn modal khác khi mở lightbox
    $('#modal-id').modal('hide'); 

    // Mở lightbox 
    $(this).ekkoLightbox();
});

// Lắng nghe sự kiện khi lightbox được đóng
$(document).on('hidden.bs.modal', '.ekko-lightbox', function() {
    // Hiện lại modal sau khi lightbox đóng
    $('#modal-id').modal('show'); 
});

// Sự kiện khi người dùng nhấn vào nút "Xem hình ảnh"
$(document).on('click', '.view-image', function () {
    clear_modal();

    $("#modal-title").text("Hoá đơn " + selectedInvoice.name);

    var images = $(this).data('images'); // Lấy dữ liệu hình ảnh từ nút
    
    if (images) {
        $('#modal-body').html(images); // Đổ hình ảnh vào modal-body
    } else {
        $('#modal-body').html('<p>Không có hình ảnh để hiển thị</p>');
    }

    $('#modal-id').modal('show'); // Mở modal
});


// Bắt sự kiện khi chọn dòng ở bảng invoices-table
$('#invoices-table tbody').on('click', 'tr', function () {
    // Xóa lựa chọn hiện tại nếu có
    invoicesTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected'); // Đánh dấu dòng đã chọn
    selectedInvoice = invoicesTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
    console.log(selectedInvoice.id);
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#invoices-search-input").on("keyup", function () {
    invoicesTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới" để thêm hoá đơn
$("#btn-add-invoice").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo hoá đơn");
  
    $("#modal-body").append(`

        <div class="form-group">
            <label for="modal-invoice-name-input">Tên hoá đơn</label>
            <input type="text" class="form-control" id="modal-invoice-name-input" placeholder="Nhập tên hoá đơn">
        </div>

        <div class="form-group">
            <label for="modal-invoice-amount-input">Số tiền</label>
            <div class="input-group">
                <input id="modal-invoice-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)">
                <div class="input-group-append">
                    <span class="input-group-text bg-primary text-white">₫</span>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="modal-issued-date-input">Thời gian phát hành hoá đơn</label>
            <input class="form-control" id="modal-issued-date-input" type="text" name="datetimes" style="height: 34px;"/>
        </div>

        <div class="form-group">
            <label for="modal-invoice-description-input">Mô tả</label>
            <textarea class="form-control" id="modal-invoice-description-input" rows="4"></textarea>
        </div>

        <div class="form-group">            
            <label for="proof-image">Hình ảnh minh chứng</label><br>
            <label class="custom-file-upload btn-primary btn-icon-text">
                <i class="ti-upload btn-icon-prepend mr-2"></i>
                <input type="file" id="fileUpload" accept="image/*" multiple>
                Chọn file
            </label><br>
            <span id="selected-file-names" class="ml-2"></span>
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

    // Hàm định dạng số tiền khi nhập
    document.getElementById('modal-invoice-amount-input').addEventListener('input', function (e) {
        let value = e.target.value.replace(/\./g, ''); // Loại bỏ các dấu chấm hiện có
        value = parseFloat(value.replace(/[^0-9]/g, '')); // Loại bỏ các ký tự không phải số

        if (!isNaN(value)) {
        e.target.value = value.toLocaleString('vi-VN'); // Định dạng số với dấu chấm
        } else {
        e.target.value = '';
        }
    });

    // Date Picker
    $('input[name="datetimes"]').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        issuedTime: moment().startOf('hour'),
        singleDatePicker: true,
        autoUpdateInput: false,
        showDropdowns: true,
        opens: "right",
        locale: {
            cancelLabel: 'Huỷ',
            applyLabel: 'Áp dụng',
            format: 'DD/MM/YYYY HH:mm',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            firstDay: 1 // Đặt ngày đầu tuần là thứ 2
        }
    });
    // Nút "Áp dụng" trong Date Range Picker
    $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
        // Hiển thị lên ô input
        $(this).val(picker.startDate.format('HH:mm DD/MM/YYYY'));

        issuedTime = picker.startDate.format('YYYY-MM-DD HH:mm:00');
    });
    // Nút "Huỷ" trong Date Range Picker
    $('input[name="datetimes"]').on('cancel.daterangepicker', function(ev, picker) {
        issuedTime = '';
        $(this).val('');
    });

    // Sự kiện thay đổi file
    $("#fileUpload").on("change", function () {
        var files = $(this)[0].files; // Lấy danh sách file
        var fileNamesHtml = '';

        // Duyệt qua từng file và tạo button hiển thị tên file
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i].name;
            var fileId = "file-" + i;

            // Tạo button có chứa tên file và nút x để xoá
            fileNamesHtml += `
                <button type="button" class="btn btn-outline-light btn-file btn-sm" id="${fileId}" data-file-index="${i}">${fileName} 
                    <span class="ml-2 close" data-file-index="${i}" style="font-size: small">&times;</span>
                </button>
            `;
        }

        // Hiển thị danh sách tên file dưới dạng các button
        $("#selected-file-names").html(fileNamesHtml);
    });

    // Xử lý sự kiện khi nhấn nút "x" để xoá file
    $(document).on("click", ".close", function () {
        var fileIndex = $(this).data('file-index');
        
        // Xoá file từ input file
        var inputFile = $('#fileUpload')[0];
        var dt = new DataTransfer(); // Tạo đối tượng DataTransfer để quản lý lại danh sách file

        // Duyệt qua danh sách file và loại bỏ file đã chọn xoá
        for (var i = 0; i < inputFile.files.length; i++) {
            if (i !== fileIndex) {
                dt.items.add(inputFile.files[i]); // Thêm file vào danh sách mới, trừ file bị xoá
            }
        }

        inputFile.files = dt.files; // Cập nhật lại danh sách file vào input

        // Xoá button tương ứng
        $(this).parent().remove();
    });


    $("#modal-id").modal("show");

    
    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(async function () {
               
        let name = $('#modal-invoice-name-input').val().trim();    
        let amount = getRawValue("#modal-invoice-amount-input");

        if (name === "") {
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên hoá đơn!"
            });
            return; 
        } 
        else if (amount === ""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập số tiền!"
            });
            return; 
        } 
        else {
            Swal.showLoading();

            // Chuẩn bị dữ liệu JSON để gửi
            var invoiceData = {
                name: name,
                amount: amount,
                issuedDate: issuedTime || '',
                description: $('#modal-invoice-description-input').val(),
                paymentReq: selectedData.id,
                images: []
            };
            // Xử lý file ảnh và chuyển đổi sang Base64
            var files = $('#fileUpload')[0].files;
            const base64Files = await Promise.all(Array.from(files).map(async file => {
                let base64 = await imageToBase64(file);
                return base64.split(",")[1]; // Loại bỏ phần "data:image/*;base64,"
            }));

            // Thêm chuỗi Base64 của các file vào dữ liệu gửi
            invoiceData.images = base64Files;


            $.ajax({
                type: "POST",
                url: "/api/invoices",
                // headers: {
                //     "Content-Type": "multipart/form-data",
                //     "Authorization": "Bearer " + utils.getCookie("authToken")
                // },
                headers: utils.defaultHeaders(),
                data: JSON.stringify(invoiceData),
                processData: false, // không xử lý dữ liệu
                success: function (res) {
                    Swal.close();
                    if(res.code==1000){
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm hoá đơn thành công!",
                            timer: 3000,
                        });
                        showDataTable(selectedData.id); // load lại bảng hoá đơn
                    }
                    else {
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
$("#btn-update-invoice").on("click", function () {
    if(selectedInvoice){
        var invoiceId = selectedInvoice.id; // Lấy ID của hoá đơn
        clear_modal();

        // Gọi API lấy thông tin quỹ theo invoiceId
        $.ajax({
            type: "GET",
            url: "/api/invoices/" + invoiceId,
            headers: utils.defaultHeaders(),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let invoice = res.result;
                    
                    $("#modal-title").text("Cập nhật hoá đơn");
                    
                    // Hiển thị dữ liệu hoá đơn trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-invoice-name-input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal-invoice-name-input" value="${invoice.name}">
                            </div>

                            <div class="form-group">
                                <label for="modal-invoice-amount-input">Số tiền</label>
                                <div class="input-group">
                                    <input id="modal-invoice-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)" value="${invoice.amount}">
                                    <div class="input-group-append">
                                        <span class="input-group-text bg-primary text-white">₫</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="modal-issued-date">Thời gian phát hành hoá đơn</label>
                                <input class="form-control" id="modal-issued-date" type="text" name="datetimes" style="height: 34px;" value="${invoice.issuedDate}"/>
                            </div>

                            <div class="form-group">
                                <label for="modal-invoice-description-input">Mô tả</label>
                                <textarea class="form-control" id="modal-invoice-description-input" rows="4">${invoice.description}</textarea>
                            </div>

                            <div class="form-group">            
                                <label for="proof-image">Hình ảnh minh chứng</label><br>
                                <label class="custom-file-upload btn-primary btn-icon-text">
                                    <i class="ti-upload btn-icon-prepend mr-2"></i>
                                    <input type="file" id="fileUpload" accept="image/*" multiple>
                                    Chọn file
                                </label><br>
                                <span id="selected-file-names" class="ml-2"></span>
                                <!-- Nơi để hiển thị các button của hình ảnh đã lưu -->
                                <span id="image-buttons"></span>
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
                    
                    // Hàm định dạng số tiền khi nhập
                    document.getElementById('modal-invoice-amount-input').addEventListener('input', function (e) {
                        let value = e.target.value.replace(/\./g, ''); // Loại bỏ các dấu chấm hiện có
                        value = parseFloat(value.replace(/[^0-9]/g, '')); // Loại bỏ các ký tự không phải số

                        if (!isNaN(value)) {
                        e.target.value = value.toLocaleString('vi-VN'); // Định dạng số với dấu chấm
                        } else {
                        e.target.value = '';
                        }
                    });

                    // Date Picker
                    $('#modal-issued-date').daterangepicker({
                        timePicker: true,
                        timePicker24Hour: true,
                        issuedTime: moment().startOf('hour'),
                        singleDatePicker: true,
                        autoUpdateInput: false,
                        showDropdowns: true,
                        opens: "right",
                        locale: {
                            cancelLabel: 'Huỷ',
                            applyLabel: 'Áp dụng',
                            format: 'DD/MM/YYYY HH:mm',
                            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                            monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                            firstDay: 1 // Đặt ngày đầu tuần là thứ 2
                        }
                    });
                    // Nút "Áp dụng" trong Date Range Picker
                    $('#modal-issued-date').on('apply.daterangepicker', function(ev, picker) {
                        // Hiển thị lên ô input
                        $(this).val(picker.startDate.format('HH:mm DD/MM/YYYY'));

                        issuedTime = picker.startDate.format('YYYY-MM-DD HH:mm:00');
                    });
                    // Nút "Huỷ" trong Date Range Picker
                    $('#modal-issued-date').on('cancel.daterangepicker', function(ev, picker) {
                        issuedTime = '';
                        $(this).val('');
                    });

                    // Sự kiện thay đổi file
                    $("#fileUpload").on("change", function () {
                        var files = $(this)[0].files; // Lấy danh sách file
                        var fileNamesHtml = '';

                        // Duyệt qua từng file và tạo button hiển thị tên file
                        for (var i = 0; i < files.length; i++) {
                            var fileName = files[i].name;
                            var fileId = "file-" + i;

                            // Tạo button có chứa tên file và nút x để xoá
                            fileNamesHtml += `
                                <button type="button" class="btn btn-outline-light btn-file btn-sm" id="${fileId}" data-file-index="${i}">${fileName} 
                                    <span class="ml-2 close" data-file-index="${i}" style="font-size: small">&times;</span>
                                </button>
                            `;
                        }

                        // Hiển thị danh sách tên file dưới dạng các button
                        $("#selected-file-names").html(fileNamesHtml);
                    });

                    // Xử lý sự kiện khi nhấn nút "x" để xoá file
                    $(document).on("click", ".close", function () {
                        var fileIndex = $(this).data('file-index');
                        
                        // Xoá file từ input file
                        var inputFile = $('#fileUpload')[0];
                        var dt = new DataTransfer(); // Tạo đối tượng DataTransfer để quản lý lại danh sách file

                        // Duyệt qua danh sách file và loại bỏ file đã chọn xoá
                        for (var i = 0; i < inputFile.files.length; i++) {
                            if (i !== fileIndex) {
                                dt.items.add(inputFile.files[i]); // Thêm file vào danh sách mới, trừ file bị xoá
                            }
                        }

                        inputFile.files = dt.files; // Cập nhật lại danh sách file vào input

                        // Xoá button tương ứng
                        $(this).parent().remove();
                    });

                    // Hiển thị các button hình ảnh đã lưu trước đó
                    if (invoice.images && invoice.images.length > 0) {
                        let imageButtonsHtml = '';
                        invoice.images.forEach((image) => {
                            console.log(image);
                            
                            imageButtonsHtml += `
                                <button type="button" class="btn btn-outline-primary m-1 image-btn" style="background-image:url('${image.image}'); background-size: cover; background-position: center; width: 150px; height: 150px;" title="Image ${image.id}"></button>
                            `;
                        });
                        $("#image-buttons").html(imageButtonsHtml);
                    }
                    
                    $("#modal-id").modal("show");

                    // Cập nhật quỹ
                    $("#modal-update-btn").click( async function () {
                        let name = $("#modal-invoice-name-input").val();
                        let amount = getRawValue("#modal-invoice-amount-input");
                        let description = $("#modal-invoice-description-input").val();
                    
                        if (name == null || name.trim() == "") {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng điền tên hoá đơn!"
                            });
                            return;
                        } 
                        else if (amount === ""){
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng nhập số tiền!"
                            });
                            return; 
                        } 
                        else {
                            Swal.showLoading();
                            // Chuẩn bị dữ liệu JSON để gửi
                            var invoiceData = {
                                name: name,
                                amount: amount,
                                issuedDate: issuedTime || '',
                                description: description,
                                paymentReq: selectedData.id,
                                images: []
                            };
                            // Xử lý file ảnh và chuyển đổi sang Base64
                            var files = $('#fileUpload')[0].files;
                            const base64Files = await Promise.all(Array.from(files).map(async file => {
                                let base64 = await imageToBase64(file);
                                return base64.split(",")[1]; // Loại bỏ phần "data:image/*;base64,"
                            }));

                            // Thêm chuỗi Base64 của các file vào dữ liệu gửi
                            invoiceData.images = base64Files;

                            $.ajax({
                                type: "PUT",
                                url: "/api/invoices?id=" + invoiceId,
                                // contentType: "application/json",
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify(invoiceData),
                                success: function (res) {
                                    Swal.close();
                                    if (res.code == 1000) {
                                        Toast.fire({
                                            icon: "success",
                                            title: "Đã cập nhật hoá đơn thành công!",
                                        });
                                        showDataTable(selectedData.id); // load lại bảng hoá đơn
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
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn hoá đơn để cập nhật!",
        });
    }
});


// Nhấn nút "Trở về"
$("#btn-back-fund").click(function (){
    $("#invoices-wrapper").prop("hidden", true);
    $("#payment-wrapper").prop("hidden", false);
    dataTable.$('tr.selected').removeClass('selected');
});