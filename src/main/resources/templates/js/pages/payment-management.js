import * as utils from "/js/pages/services/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable; // bảng đề nghị thanh toán
let selectedData; // Biến lưu dữ liệu đã chọn

var invoicesTable; // bảng hoá đơn
let selectedInvoice; // Biến lưu hoá đơn đã chọn

var fundOption = []; // quỹ
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

    var urlFund = "/api/funds/active";
    if (userRole === 'USER_MANAGER'){
        urlFund = "/api/funds/by-treasurer";

        // Hiển thị button "Thanh toán" và ẩn nút "Xác nhận"
        $('#btn-process-payment-request').prop("hidden", false);
        $('#btn-confirm-payment-request').prop("hidden", true);
    }
    if (userRole === 'ADMIN'){
        // Hiển thị button "Thanh toán" 
        $('#btn-process-payment-request').prop("hidden", false);
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
    $("#btn-view-payment-request").on("click", async function () {    
        await loadPaymentRequestData();
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

        columns: [
            { data: "number", className: "text-center" },
            { data: "fund", 
                render: function (data, type, row) {
                    let html = ""; 
                    
                    if (row.proofImages.length >= 1){
                        html = `<a class="view-image" role="button" id="btn-view-image" style="color: white;" 
                                    data-images='${row.proofImages}'>
                                    <b> Xem hình ảnh </b>
                                </a> `
                    }

                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data.fundName}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Mô tả: ${row.description} <br>
                                ${row.updatedDate? "Ngày cập nhật: " + utils.formatDateTime(row.updatedDate) : ""} <br>
                                ${html}                                
                            </p>
                        </details>`;
                }
            },
            { data: "user",
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data.fullname}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Phòng ban: ${row.user.department.name} <br>
                                Email: ${row.user.email} <br>
                                ${row.user.phone? "Số điện thoại: " + row.user.phone : ""}                                
                            </p>
                        </details>`;
                }
            },
            { data: "amount", 
                className: "text-right",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "createdDate", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatDateTime(data);
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
                        case 4:
                            statusClass = 'btn-inverse-primary';
                            statusText = 'Đã thanh toán';
                            break;
                        case 5:
                            statusClass = 'btn-inverse-info';
                            statusText = 'Đã nhận';
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
        drawCallback: function (settings) {
            // Số thứ tự không thay đổi khi sort hoặc paginations
            var api = this.api();
            var start = api.page.info().start;
            api.column(0, { page: "current" })
                .nodes()
                .each(function (cell, i) {
                    cell.innerHTML = start + i + 1;
                });

            // Gọi modal khi click vào nút "Đã duyệt"
            $('#payment-request-table tbody').on('click', 'button.btn-inverse-success', function () {
                var data = $('#payment-request-table').DataTable().row($(this).parents('tr')).data();
                showDisbursementModal(data);  // Gọi modal giải ngân và truyền dữ liệu đề nghị thanh toán
                console.log(data);
                
            });

        },

        initComplete: function() {
            $('.dataTables_paginate').addClass('custom-paginate'); // phân trang của table
        },
    });
});


// Gọi api lấy dữ liệu danh sách các đề nghị thanh toán
async function loadPaymentRequestData() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ

    var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
    var status = '';
    var departmentId = ''; 
    var userId = ''; 

    if (!filter && fundId == '') {
        Toast.fire({
            icon: "warning",
            title: "Vui lòng chọn bộ lọc!",
        });
        return;
    }
    else if (filter === 'time') {
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
    
    $('#card-description').prop("hidden", false);
    
    var urlPaymentReq = "/api/payment-requests/filter?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId + "&status=" + status;
    if (userRole === 'USER_MANAGER') {
        urlPaymentReq = "/api/payment-requests/treasurer/filter?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId + "&status=" + status;
    }
    // Gọi API với AJAX để lấy dữ liệu
    await $.ajax({
        url: urlPaymentReq,
        type: "GET",
        headers: utils.defaultHeaders(),
        beforeSend: function () {
            Swal.showLoading();
        },
        success: function(res) {
            Swal.close();
            if (res.code == 1000) {
                // Cập nhật giá trị totalAmount vào thẻ h3
                $('#total-amount-div').prop("hidden", false);
                document.getElementById("total-amount").innerText = utils.formatCurrency(res.result.totalAmount);

                var data = [];
                var counter = 1;
                res.result.paymentRequests.forEach(function (paymentReq) {
                    // Xử lý hình ảnh, giả sử API trả về thuộc tính `images` là danh sách hình ảnh base64 hoặc URL
                    var proofImagesHtml = '';
                    if (paymentReq.images && paymentReq.images.length > 0) {
                        paymentReq.images.forEach(function (image) {
                            // Nếu hình ảnh là base64
                            proofImagesHtml += `
                                <a href="data:image/jpeg;base64,${image.image}" data-toggle="lightbox" class="proof-image" style="display:inline-block; margin: 10px;" data-gallery="example-gallery">
                                    <img src="data:image/jpeg;base64,${image.image}" style="width: 200px; height: 200px; object-fit: cover;" class="img-fluid">
                                    <p style="color: black; text-align: center; font-weight: bold;">${image.fileName}</p>
                                </a>
                            `;
                                    
                        });
                    } else {
                        proofImagesHtml = '';
                    }

                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        totalAmount: res.result.totalAmount,
                        amount: paymentReq.amount, 
                        status: paymentReq.status,
                        description: paymentReq.description,
                        createdDate: paymentReq.createDate,
                        updatedDate: paymentReq.updateDate,
                        user: paymentReq.user,
                        fund: paymentReq.fund,
                        proofImages: proofImagesHtml,
                        id: paymentReq.id, // ID của payment request 
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


// Hiển thị dữ liệu tuỳ vào role của người dùng
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
    // Đối với Kế toán và Quản trị viên
    if (roles.includes('ACCOUNTANT')) {
        userRole = "ACCOUNTANT";
    } 
    // Đối với Quản trị viên
    if (roles.includes('ADMIN')) {
        userRole = "ADMIN";
    }
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
$(document).on('click', '#payment-request-table tbody tr', async function () {
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


// Bắt sự kiện keyup "Tìm kiếm" để tìm kiếm đề nghị thanh toán
$("#payment-search-input").on("keyup", function () {
    dataTable.search(this.value).draw();
});


// Nhấn nút "Xác nhận"
$("#btn-confirm-payment-request").on("click",async function () {
    // Kiểm tra nếu không có dữ liệu được chọn
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để xác nhận!",
        });
        return;
    }

    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "đã duyệt" (status = 3) hoặc "từ chối" (status = 0)
    if (selectedData.status == 0 || selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 1) { 
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán chưa được gửi",
        });
        return;
    }

    var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán

    // Hiển thị thông báo xác nhận từ người dùng
    const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Bạn sẽ xác nhận đề nghị thanh toán",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Duyệt",
        denyButtonText: "Từ chối",
        cancelButtonText: "Huỷ"
    }).then((result) => {
        if (result.isConfirmed) {         
            Swal.showLoading();   
            $.ajax({
                type: "PUT",
                url: "/api/payment-requests/confirm/" + paymentReqId + "?isApproved=true",
                headers: utils.defaultHeaders(),
                success: async function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        if ($('#fund-select').val() !== null || $('#filter-type-select').val() !== null) {
                            await loadPaymentRequestData();
                        }
                        Toast.fire({
                            icon: "success",
                            title: "Đã duyệt đề nghị thanh toán!",
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
        } 
        else if (result.isDenied) {
            Swal.showLoading();
            $.ajax({
                type: "PUT",
                url: "/api/payment-requests/confirm/" + paymentReqId + "?isApproved=false",
                headers: utils.defaultHeaders(),
                success: async function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        if ($('#fund-select').val() !== null || $('#filter-type-select').val() !== null) {
                            await loadPaymentRequestData();
                        }
                        Toast.fire({
                            icon: "success",
                            title: "Đã từ chối đề nghị thanh toán!",
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
        }
    });
});


// Nhấn nút "Thanh toán"
$("#btn-process-payment-request").on("click", async function () {
    // Kiểm tra nếu không có dữ liệu được chọn
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để thực hiện!",
        });
        return;
    }
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "đã duyệt" (status = 3) hoặc "từ chối" (status = 0)
    if (selectedData.status == 0 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 2) { 
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán chưa được xác nhận",
        });
        return;
    }
    else if (selectedData.status == 1) { 
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán chưa được gửi",
        });
        return;
    }

    console.log(selectedData);
    
    utils.clear_modal();
  
    $("#modal-title").text("Thanh toán");

    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-fund-input">Tên quỹ</label>
            <input type="text" class="form-control" id="modal-fund-input" value="${selectedData.fund.fundName}" readonly>
        </div>

        <div class="form-group">
            <label for="modal-amount-input">Số tiền</label>
            <input type="text" class="form-control" id="modal-amount-input" value="${utils.formatCurrency(selectedData.amount)}" readonly>
        </div>

        <div class="form-group">
            <label for="modal-description-input">Mô tả</label>
            <textarea class="form-control" id="modal-description-input" rows="10" readonly>${selectedData.description}</textarea>
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

    $("#modal-submit-btn").click(async function () {
        var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán

        // Hiển thị thông báo xác nhận từ người dùng
        const result = await Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn sẽ thanh toán " + utils.formatCurrency(selectedData.amount),
            icon: "warning",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            denyButtonText: "Từ chối",
            cancelButtonText: "Huỷ"
        });

        Swal.showLoading();
        if (result.isConfirmed) {
            // Chuẩn bị dữ liệu JSON để gửi
            var data = {
                description: $('#modal-description-input').val(),
                fund: $('#modal-fund-input').val(),
                fileNames: [],
                images: []
            };
            // Xử lý file ảnh và chuyển đổi sang Base64
            var files = $('#fileUpload')[0].files;
            const base64Files = await Promise.all(Array.from(files).map(async file => {
                let base64 = await utils.imageToBase64(file);
                data.fileNames.push(file.name); // Lưu tên file vào mảng
                return base64.split(",")[1]; // Loại bỏ phần "data:image/*;base64,"
            }));

            // Thêm chuỗi Base64 của các file vào dữ liệu gửi
            data.images = base64Files;

            $.ajax({
                type: "PUT",
                url: "/api/payment-requests/process/" + paymentReqId,
                headers: utils.defaultHeaders(),
                data: JSON.stringify(data),
                processData: false, // không xử lý dữ liệu
                success: async function (res) {
                    Swal.close();
                    if (res.code == 1000) {
                        if ($('#fund-select').val() !== null || $('#filter-type-select').val() !== null) {
                            await loadPaymentRequestData();
                        }
                        Toast.fire({
                            icon: "success",
                            title: "Đã thanh toán thành công!",
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
        }
        else if (result.isDenied) {
            Swal.close();
            return;
        }
        $("#modal-id").modal("hide"); 
    });   
    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    }); 
});


// Sự kiện khi người dùng nhấn vào nút "Xem hình ảnh"
$(document).on('click', '#btn-view-image', function () {
    utils.clear_modal();

    $("#modal-title").text("Đề nghị thanh toán");

    var images = $(this).data('images'); // Lấy dữ liệu hình ảnh từ nút
    
    if (images) {
        $('#modal-body').html(images); // Đổ hình ảnh vào modal-body
    } else {
        $('#modal-body').html('<p>Không có hình ảnh để hiển thị</p>');
    }

    $('#modal-id').modal('show'); // Mở modal
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
            beforeSend: function () {
                Swal.showLoading();
            },
            dataSrc: function (res) {
                Swal.close();
                if (res.code == 1000) {
                    var dataSet = [];
                    var stt = 1;

                    res.result.forEach(function (invoices){
                        // Xử lý hình ảnh, giả sử API trả về thuộc tính `images` là danh sách hình ảnh base64 hoặc URL
                        var proofImagesHtml = '';
                        if (invoices.images && invoices.images.length > 0) {
                            invoices.images.forEach(function (image) {
                                // Nếu hình ảnh là base64
                                proofImagesHtml += `
                                    <a href="data:image/jpeg;base64,${image.image}" data-toggle="lightbox" class="proof-image" style="display:inline-block; margin: 10px;" data-gallery="example-gallery">
                                        <img src="data:image/jpeg;base64,${image.image}" style="width: 200px; height: 200px; object-fit: cover;" class="img-fluid">
                                        <p style="color: black; text-align: center; font-weight: bold;">${image.fileName}</p>
                                    </a>
                                `;
                                        
                            });
                        } else {
                            proofImagesHtml = '';
                        }

                        dataSet.push({
                            number: stt++,
                            id: invoices.id,
                            name: invoices.name,
                            amount: invoices.amount,
                            issuedDate: invoices.issuedDate,
                            description: invoices.description,
                            createDate: invoices.createDate,
                            updateDate: invoices.updateDate,
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
                className: 'text-left align-middle' // Căn giữa nội dung của tất cả các cột
            }
        ],
        columns: [
            { data: "number" },
            { data: "name", 
                render: function (data, type, row) {
                    let html = ""; 
                    
                    if (row.proofImages.length >= 1){
                        html = `<a class="view-image" role="button" id="btn-image-invoice" style="color: white;" 
                                    data-images='${row.proofImages}'>
                                    <b> Xem hình ảnh </b>
                                </a> `
                    }

                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Mô tả: ${row.description} <br>
                                ${html}
                            </p>
                        </details>`;
                }
            },
            { data: "amount", 
                className: "text-right",
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "issuedDate", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatDateTime(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "createDate", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatDateTime(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "updateDate", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatDateTime(data);
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
$(document).on('click', '#btn-image-invoice', function () {
    utils.clear_modal();

    $("#modal-title").text("Hoá đơn " + selectedInvoice.name);

    var images = $(this).data('images'); // Lấy dữ liệu hình ảnh từ nút
    
    if (images) {
        $('#modal-body').html(images); // Đổ hình ảnh vào modal-body
    } else {
        $('#modal-body').html('<p>Không có hình ảnh để hiển thị</p>');
    }

    $('#modal-id').modal('show'); // Mở modal
});


// Bắt sự kiện khi chọn dòng
$('#invoices-table tbody').on('click', 'tr', function () {
    // Kiểm tra xem dòng đã được chọn chưa
    if ($(this).hasClass('selected')) {
        // Nếu đã được chọn, bỏ chọn nó
        $(this).removeClass('selected');        
        selectedInvoice = null; // Đặt selectedData về null vì không có dòng nào được chọn
    } else {
        // Nếu chưa được chọn, xóa lựa chọn hiện tại và chọn dòng mới
        invoicesTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected'); // Đánh dấu dòng đã chọn
        selectedInvoice = invoicesTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
        console.log(selectedInvoice.id);
    }
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#invoices-search-input").on("keyup", function () {
    invoicesTable.search(this.value).draw();
});


// Nhấn nút "Trở về"
$("#btn-back-fund").click(function (){
    $("#invoices-wrapper").prop("hidden", true);
    $("#payment-wrapper").prop("hidden", false);
    dataTable.$('tr.selected').removeClass('selected');
    $("#btn-view-payment-request").click();
});




// Hiển thị nút "Gửi" và nút "Xác nhận" tuỳ vào role của người dùng
async function setButtonVisibility() {
    try {
        const userInfo = await utils.getUserInfo(); // Lấy thông tin người dùng từ localStorage 
        if (!userInfo) {
            throw new Error("Không thể lấy thông tin người dùng");
        }
        
        const paymentButton = $('#btn-payment-request'); 
        const roles = userInfo.roles.map(role => role.id); // Lấy danh sách các role của user

        // Hiển thị nút "Gửi" đối với Nhân viên
        if (roles.includes('USER')) {
            paymentButton.html('<i class="fa-solid fa-paper-plane mr-2"></i> Gửi'); 
            paymentButton.on('click', function() {
                submitPaymentRequest(); // Gửi đề nghị thanh toán cho quản lý
            });
        } 
        // Hiển thị nút "Xác nhận" đối với Nhân viên quản lý quỹ và Quản trị viên
        else if (roles.includes('USER_MANAGER') || roles.includes('ADMIN')) {
            paymentButton.html('<i class="fa-solid fa-circle-check mr-2"></i> Xác nhận'); 
            paymentButton.on('click', function() {
                confirmPaymentRequest(); // Xác nhận đề nghị thanh toán
            });
        } 
    } catch (error) {
        console.error(error.message);
        Toast.fire({
            icon: "error",
            title: "Lỗi khi kiểm tra phân quyền của người dùng",
        });
    }
}

// Hàm xử lý khi click vào button "Xác nhận" của quản lý quỹ
async function confirmPaymentRequest() {
    // Kiểm tra nếu không có dữ liệu được chọn
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để xác nhận!",
        });
        return;
    }

    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "đã duyệt" (status = 3) hoặc "từ chối" (status = 0)
    if (selectedData.status == 0 || selectedData.status == 3) {
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 1) { // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "chưa xử lý" (status = 1)
        Toast.fire({
            icon: "error",
            title: "Không thể xác nhận!",
            text: "Đề nghị thanh toán chưa được gửi",
        });
        return;
    }

    var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán

    // Hiển thị thông báo xác nhận từ người dùng
    const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Bạn sẽ xác nhận đề nghị thanh toán",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Duyệt",
        denyButtonText: "Từ chối",
        cancelButtonText: "Huỷ"
    }).then((result) => {
        if (result.isConfirmed) {            
            $.ajax({
                type: "PUT",
                url: "/api/payment-requests/confirm/" + paymentReqId + "?isApproved=true",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đề nghị thanh toán đã được duyệt",
                        });
                        $("#btn-view-payment-request").click(); // load lại bảng đề nghị thanh toán
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
                }
            });
        } 
        else if (result.isDenied) {
            $.ajax({
                type: "PUT",
                url: "/api/payment-requests/confirm/" + paymentReqId + "?isApproved=false",
                headers: utils.defaultHeaders(),
                success: function (res) {
                    if (res.code == 1000) {
                        Toast.fire({
                            icon: "success",
                            title: "Đề nghị thanh toán đã bị từ chối",
                        });
                        $("#btn-view-payment-request").click(); // load lại bảng đề nghị thanh toán
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
                }
            });
        }
    });

}

// Hàm xử lý khi click vào button của nhân viên
async function submitPaymentRequest() {
    // Kiểm tra nếu không có dữ liệu được chọn
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để gửi!",
        });
        return;
    }

    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "đã duyệt" (status = 3) hoặc "từ chối" (status = 0)
    if (selectedData.status == 0 || selectedData.status == 3) {
        Toast.fire({
            icon: "error",
            title: "Không thể gửi!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 2) { // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "chưa xử lý" (status = 1)
        Toast.fire({
            icon: "error",
            title: "Không thể gửi!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    }

    var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán

    // Hiển thị thông báo xác nhận từ người dùng
    const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Bạn sẽ gửi đề nghị thanh toán cho thủ quỹ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Huỷ"
    });

    // Nếu người dùng không xác nhận, dừng việc xử lý
    if (!result.isConfirmed) {
        return;
    }

    // Thực hiện gửi đề nghị thanh toán
    await $.ajax({
        type: "PUT",
        url: "/api/payment-requests/send/" + paymentReqId,
        headers: utils.defaultHeaders(),
        beforeSend: function () {
            Swal.showLoading();
        },
        success: function (res) {
            Swal.close();
            if (res.code == 1000) {
                Toast.fire({
                    icon: "success",
                    title: "Đề nghị thanh toán đã được gửi",
                });
                $("#btn-view-payment-request").click(); // load lại bảng đề nghị thanh toán
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
}