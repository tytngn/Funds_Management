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

        // Ẩn tất cả các trường trước
        $('#trans-times-div').prop("hidden", true);
        $('#status-div').prop("hidden", true);

        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'time') {
            $('#trans-times-div').prop("hidden", false); // Hiển thị Date Range Picker
        } 
        else if (filterType === 'status') {
            $('#status-div').prop("hidden", false); // Hiển thị Select Trạng thái 
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
                    });
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
        url: "/api/transaction-types/contribute",
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


    // Nhấn nút "Xem"
    $("#btn-view-contribute").on("click", function () {    
        // Nếu không có giá trị thì gán ''
        startDate = startDate || ''; 
        endDate = endDate || ''; 

        var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ
        var transTypeId = $('#trans-type-select').val() || ''; // Lấy giá trị của select loại giao dịch

        var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
        var status = '';

        // Kiểm tra nếu không chọn bộ lọc nào và không chọn quỹ, loại giao dịch
        if (!filter && fundId == '' && transTypeId == '') {
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

        console.log("quỹ " + fundId);
        console.log("loại " + transTypeId);
        console.log("bắt đầu " + startDate);
        console.log("kết thúc " + endDate );
        console.log("trạng thái " + status);
        
       
        // Gọi API với AJAX để lấy dữ liệu 
        $.ajax({
            url: "/api/fund-transactions/user-contributions/filter?fundId=" + fundId + "&transTypeId=" + transTypeId + "&startDate=" + startDate + "&endDate=" + endDate + "&status=" + status, // Đường dẫn API của bạn
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
                    res.result.transactions.forEach(function (trans) {
                        data.push({
                            number: counter++, // Số thứ tự tự động tăng
                            totalAmount: res.result.totalAmount, // totalAmount từ res.result
                            fund: trans.fund.fundName,
                            transactionType: trans.transactionType.name,
                            amount: trans.amount, 
                            description: trans.description,
                            status: trans.status,
                            transDate: trans.transDate,                          
                            id: trans.id, // ID của transaction 
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
        scrollX: true,        // Đảm bảo bảng có thể cuộn ngang
        scrollCollapse: true, // Khi bảng có ít dữ liệu, không cần thêm khoảng trống
        dom: 'lrtip',  // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columns: [
            { data: "number" },
            { data: "fund", 
                render: function (data, type, row) {
                    return `
                        <details>
                            <summary class="text-left">
                                <b>${data}</b>
                            </summary> <br>
                            <p class="text-left" style="white-space: normal; !important">
                                Ghi chú: ${row.description} <br>
                            </p>
                        </details>`;
                }
            },
            { data: "transactionType", className: "text-center" },
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


// Bắt sự kiện khi chọn dòng
$('#transaction-contribute-table tbody').on('click', 'tr', function () {
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
    console.log("tìm kiếm");
    dataTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới"
$("#btn-add-contribute").on("click", function () {
    utils.clear_modal();
  
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
                <input id="modal-transaction-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)" placeholder="Nhập số tiền">
                <div class="input-group-append">
                    <span class="input-group-text bg-primary text-white">₫</span>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="modal-transaction-description-input">Ghi chú</label>
            <textarea class="form-control" id="modal-transaction-description-input" rows="4" placeholder="Nhập lý do đóng góp"></textarea>
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
        e.target.value = utils.formatNumber(value); // Định dạng số với dấu chấm
        } else {
        e.target.value = '';
        }
    });


    $("#modal-id").modal("show");

    
    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(function () {
        let fund = $("#modal-fund-name").val();
        let transactionType = $("#modal-transaction-type").val();
        let amount = utils.getRawValue("#modal-transaction-amount-input");
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
                url: "/api/fund-transactions",
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