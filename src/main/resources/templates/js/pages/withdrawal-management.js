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
let selectedData; // Biến lưu dữ liệu quỹ đã chọn
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
        url: "/api/transaction-types/withdraw",
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
    $("#btn-view-withdraw").on("click",async function () {    
       await loadWithdrawalData();
    });

    // Bảng rút quỹ        
    dataTable = $('#withdrawal-management-table').DataTable({
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
        dom: 'lrtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columns: [
            { data: "number" },
            { data: "fund" ,
                render: function (data, type, row) {
                    let html = ""; 
                    
                    if (row.proofImages.length >= 1){
                        html = `<a class="view-image" role="button" style="color: white;" 
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
                                ${row.description? "Ghi chú: " + row.description : ""} <br>
                                ${html}
                            </p>
                        </details>`;
                }
            },
            { data: "transactionType" },
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
            { data: "trader" ,
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
            { data: "transDate", 
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


// Gọi api lấy dữ liệu danh sách các giao dịch rút quỹ
async function loadWithdrawalData() {
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
            title: "Vui lòng chọn bộ lọc!",
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

    // Gọi API với AJAX để lấy dữ liệu
    await $.ajax({
        url: "/api/fund-transactions/withdraw/filter?fundId=" + fundId + "&transTypeId=" + transTypeId + "&startDate=" + startDate + "&endDate=" + endDate + "&departmentId=" + departmentId + "&userId=" + userId + "&status=" + status, // Đường dẫn API của bạn
        type: "GET",
        headers: utils.defaultHeaders(),
        beforeSend: function(){
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
                res.result.transactions.forEach(function (transaction) {
                    // Xử lý hình ảnh, giả sử API trả về thuộc tính `images` là danh sách hình ảnh base64 hoặc URL
                    var proofImagesHtml = '';
                    if (transaction.images && transaction.images.length > 0) {
                        transaction.images.forEach(function (image) {
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
                        amount: transaction.amount, 
                        description: transaction.description,
                        status: transaction.status,
                        transDate: transaction.transDate,
                        trader: transaction.user.fullname,
                        department: transaction.user.department.name,
                        fund: transaction.fund.fundName,
                        transactionType: transaction.transactionType.name,
                        proofImages: proofImagesHtml,  
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

// Bắt sự kiện khi chọn dòng
$('#withdrawal-management-table tbody').on('click', 'tr', function () {
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
$("#search-input").on("keyup", function () {
    dataTable.search(this.value).draw();
});


// Nhấn nút "Xác nhận"
$("#btn-confirm-withdraw").on("click",async function () {
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để xác nhận!",
        });
        return;
    }
    var fundTransactionId = selectedData.id;

    const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Bạn sẽ xác nhận giao dịch",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Duyệt",
        denyButtonText: "Từ chối",
        cancelButtonText: "Huỷ"
    });

    if (result.isConfirmed) {
        try {
            const res = await $.ajax({
                type: "PUT",
                url: "/api/fund-transactions/approve/" + fundTransactionId,
                headers: utils.defaultHeaders(),
            });
            if (res.code == 1000) {    
                if ($('#fund-select').val() !== null || $('#trans-type-select').val() !== null || $('#filter-type-select').val() !== null){
                    await loadWithdrawalData();                               
                }                               
                Toast.fire({
                    icon: "success",
                    title: "Đã duyệt giao dịch",
                });
            } 
            else {
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                });
            }
        } catch (xhr) {
            if (xhr && xhr.status >= 400) {
                var err = utils.handleAjaxError(xhr);
                Toast.fire({
                    icon: "error",
                    title: err.message
                });
            }          
        }
    }
    else if (result.isDenied) {
        try {
            const res = await $.ajax({
                type: "PUT",
                url: "/api/fund-transactions/reject/" + fundTransactionId,
                headers: utils.defaultHeaders(),
            });

            if (res.code == 1000) {
                if ($('#fund-select').val() !== null || $('#trans-type-select').val() !== null || $('#filter-type-select').val() !== null){
                    await loadWithdrawalData();              
                }
                Toast.fire({
                    icon: "success",
                    title: "Đã từ chối giao dịch",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi, chi tiết:<br>" + res.message,
                });
            }
        } catch (xhr) {
            if (xhr && xhr.status >= 400) {
                var err = utils.handleAjaxError(xhr);
                Toast.fire({
                    icon: "error",
                    title: err.message
                });
            }     
        }
    }
});


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
    utils.clear_modal();

    $("#modal-title").text("Hình ảnh giao dịch");

    var images = $(this).data('images'); // Lấy dữ liệu hình ảnh từ nút
    
    if (images) {
        $('#modal-body').html(images); // Đổ hình ảnh vào modal-body
    } else {
        $('#modal-body').html('<p>Không có hình ảnh để hiển thị</p>');
    }

    $('#modal-id').modal('show'); // Mở modal
});