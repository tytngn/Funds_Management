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

var fundOption = [];

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

        clearFilter ();

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
                    var tooltipText = ''; 

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
                            tooltipText = 'Nhấn nút để xác nhận đã nhận tiền';
                            break;
                        case 5:
                            statusClass = 'btn-inverse-info';
                            statusText = 'Đã nhận';
                            break;
                    }

                    return `
                        <div class="d-flex justify-content-center align-items-center" title="${tooltipText}" data-toggle="tooltip">
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

            // Khởi tạo tooltips cho các nút sau khi vẽ lại bảng
            $('[data-toggle="tooltip"]').tooltip();
            // Gọi modal khi click vào nút "Đã thanh toán"
            $('#payment-request-table tbody').on('click', 'button.btn-inverse-primary', async function () {
                var data = $('#payment-request-table').DataTable().row($(this).parents('tr')).data();
                await confirmReceivedPayment(data);  // Gọi modal xác nhận đã nhận tiền 
                $(this).tooltip('hide');
            });           
        },

        initComplete: function() {
            $('.dataTables_paginate').addClass('custom-paginate'); // phân trang của table
        },
    });            
});


// Gọi api lấy dữ liệu danh sách các đề nghị thanh toán của người dùng
async function loadPaymentRequestData() {
    $('#card-description').prop("hidden", false); // Hiển thị mô tả mở hoá đơn

    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ

    var filter = $('#filter-type-select').val(); // Lấy giá trị của select loại bộ lọc
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
        if(status === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn trạng thái!",
            });
            return;
        } 
    } 
   
    // Gọi API với AJAX để lấy dữ liệu 
    await $.ajax({
        url: "/api/payment-requests/user/filter?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&status=" + status, // Đường dẫn API
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


// Gọi api xác nhận đã nhận tiền
async function confirmReceivedPayment(data){
    var paymentReqId = data.id;

    const result = await Swal.fire({
        title: 'Xác nhận nhận tiền',
        text: "Bạn có chắc chắn đã nhận được số tiền thanh toán này?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Đã nhận",
        cancelButtonText: "Huỷ"
    });

    // Nếu người dùng không xác nhận, dừng việc xử lý
    if (!result.isConfirmed) {
        return;
    }
    Swal.showLoading();

    // Thực hiện xác nhận nhận tiền
    await $.ajax({
        type: "PUT",
        url: "/api/payment-requests/confirm-receipt/" + paymentReqId,
        headers: utils.defaultHeaders(),
        success: async function (res) {
            Swal.close();
            if (res.code == 1000) {
                await loadPaymentRequestData(); // load lại bảng đề nghị thanh toán
                Toast.fire({
                    icon: "success",
                    title: "Đã xác nhận thành công!",
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


function clearFilter () {
    // Clear lựa chọn của select
    $('#status-select').val(null).trigger('change');

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


// Nhấn nút "Thêm mới" để thêm đề nghị thanh toán
$("#btn-add-payment-request").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Tạo đề nghị thanh toán");
  
    $("#modal-body").append(`

        <div class="form-group">
            <label for="modal-fund">Tên quỹ</label>
            <select class="form-control" id="modal-fund" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal-payment-request-description-input">Ghi chú</label>
            <textarea class="form-control" id="modal-payment-request-description-input" rows="4" placeholder="Nhập lý do tạo đề nghị thanh toán"></textarea>
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
        placeholder: "Chọn quỹ",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: fundOption
    });
    // Đặt lại giá trị của select-dropdown về null
    $('#modal-fund').val("").trigger('change');


    $("#modal-id").modal("show");

    // Lưu thông tin của đề nghị thanh toán
    $("#modal-submit-btn").click(function () {
        let fund = $("#modal-fund").val();
        let description = $("#modal-payment-request-description-input").val();
    
        if(fund == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng chọn quỹ!"
            });
            return;
        } 
        else if (description == null || description.trim() == ""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập lý do tạo đề nghị thanh toán!"
            });
            return;
        } 
        else {
            Swal.showLoading();
            $.ajax({
                type: "POST",
                url: "/api/payment-requests",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    description: description,
                    fund: fund,
                }),
                success: async function (res) {
                    Swal.close();
                    if(res.code==1000){
                        console.log("success");
                        await loadPaymentRequestData();
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


// Nhấn nút "Cập nhật" để cập nhật đề nghị thanh toán ở trạng thái chưa xử lý
$("#btn-update-payment-request").on("click", function () {
    if (!selectedData){
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để thực hiện!",
        });
        return;
    }
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái chưa xử lý (status = 1)
    else if (selectedData.status == 2){
        Toast.fire({
            icon: "error",
            title: "Không thể cập nhật!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    } 
    else if (selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể cập nhật!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else {
        var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán
        utils.clear_modal();
        Swal.showLoading();
        // Gọi API lấy thông tin đề nghị thanh toán theo paymentReqId
        $.ajax({
            type: "GET",
            url: "/api/payment-requests/" + paymentReqId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let paymentReq = res.result;
                    
                    $("#modal-title").text("Cập nhật đề nghị thanh toán");
                    
                    // Hiển thị dữ liệu trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-fund">Tên quỹ</label>
                                <select class="form-control" id="modal-fund" style="width: 100%;"></select>
                            </div>

                            <div class="form-group">
                                <label for="modal-payment-request-description-input">Ghi chú</label>
                                <textarea class="form-control" id="modal-payment-request-description-input" rows="4" placeholder="Nhập lý do tạo đề nghị thanh toán">${paymentReq.description}</textarea>
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
                    
                    $('#modal-fund').select2({
                        placeholder: "Chọn quỹ",
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                        data: fundOption
                    });
                    // Đặt lại giá trị của select-dropdown về null
                    $('#modal-fund').val(paymentReq.fund.id).trigger('change');

                    $("#modal-id").modal("show");

                    // Cập nhật thông tin của đề nghị thanh toán
                    $("#modal-update-btn").click(function () {
                        let fund = $("#modal-fund").val();
                        let description = $("#modal-payment-request-description-input").val();
                    
                        if(fund == null){
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng chọn quỹ!"
                            });
                            return;
                        } 
                        else if (description == null || description.trim() == ""){
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng nhập lý do tạo đề nghị thanh toán!"
                            });
                            return;
                        } 
                        else {
                            Swal.showLoading();
                            $.ajax({
                                type: "PUT",
                                url: "/api/payment-requests/" + paymentReqId,
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    description: description,
                                    fund: fund                                    
                                }),
                                success: async function (res) {
                                    Swal.close();
                                    if (res.code == 1000) {
                                        await loadPaymentRequestData();
                                        Toast.fire({
                                            icon: "success",
                                            title: "Đã cập nhật đề nghị thanh toán!",
                                        });
                                        $("#modal-id").modal("hide");
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

                    // Khi nhấn nút "Huỷ bỏ"
                    $("#modal-cancel-btn").click(function () {
                        $('#modal-id').modal('hide');
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Không thể lấy thông tin đề nghị thanh toán<br>" + res.message,
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


// Nhấn nút "Xoá" để xoá đề nghị thanh toán ở trạng thái chưa xử lý
$("#btn-remove-payment-request").on("click", async function () {
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để thực hiện!",
        });
        return;
    }
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái chưa xử lý (status = 1)
    else if (selectedData.status == 2){
        Toast.fire({
            icon: "error",
            title: "Không thể xoá!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    } else if (selectedData.status == 0 || selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể xoá!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else {
        var paymentReqId = selectedData.id; // Lấy ID của đề nghị thanh toán

        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ xoá đề nghị thanh toán",
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
        // Thực hiện xoá đề nghị thanh toán
        await $.ajax({
            type: "DELETE",
            url: "/api/payment-requests?id=" + paymentReqId,
            headers: utils.defaultHeaders(),
            success: async function (res) {
                Swal.close();
                if (res.code == 1000) {
                    await loadPaymentRequestData(); // load lại bảng đề nghị thanh toán
                    Toast.fire({
                        icon: "success",
                        title: "Đã xoá đề nghị thanh toán!",
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


// Nhấn nút "Gửi" để gửi đề nghị thanh toán (chuyển trạng thái sang chờ duyệt)
$("#btn-send-payment-request").on("click", async function () {
    // Kiểm tra nếu không có dữ liệu được chọn
    if (!selectedData) {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn đề nghị thanh toán để thực hiện!",
        });
        return;
    }

    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái "đã duyệt" (status = 3) hoặc "từ chối" (status = 0)
    if (selectedData.status == 0 || selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
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
        text: "Bạn sẽ gửi đề nghị thanh toán cho kế toán?",
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

    // Thực hiện gửi đề nghị thanh toán
    await $.ajax({
        type: "PUT",
        url: "/api/payment-requests/send/" + paymentReqId,
        headers: utils.defaultHeaders(),
        success: async function (res) {
            Swal.close();
            if (res.code == 1000) {
                await loadPaymentRequestData();
                Toast.fire({
                    icon: "success",
                    title: "Đã gửi đề nghị thanh toán!",
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
                    // console.table(res.result);

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
        selectedInvoice = null; // Đặt selectedInvoice về null vì không có dòng nào được chọn
    } else {
        // Nếu chưa được chọn, xóa lựa chọn hiện tại và chọn dòng mới
        invoicesTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected'); // Đánh dấu dòng đã chọn
        selectedInvoice = invoicesTable.row(this).data(); // Lưu dữ liệu dòng đã chọn
        console.log(selectedInvoice);
    }
});


// Bắt sự kiện keyup "Tìm kiếm"
$("#invoices-search-input").on("keyup", function () {
    invoicesTable.search(this.value).draw();
});


// Nhấn nút "Thêm mới" để thêm hoá đơn
$("#btn-add-invoice").on("click", function () {
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái 
    if (selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể thêm hoá đơn!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 2) { 
        Toast.fire({
            icon: "error",
            title: "Không thể thêm hoá đơn!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    }

    utils.clear_modal();
  
    $("#modal-title").text("Tạo hoá đơn");
  
    $("#modal-body").append(`

        <div class="form-group">
            <label for="modal-invoice-name-input">Tên hoá đơn</label>
            <input type="text" class="form-control" id="modal-invoice-name-input" placeholder="Nhập tên hoá đơn">
        </div>

        <div class="form-group">
            <label for="modal-invoice-amount-input">Số tiền</label>
            <div class="input-group">
                <input id="modal-invoice-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)" placeholder="Nhập số tiền">
                <div class="input-group-append">
                    <span class="input-group-text bg-primary text-white">₫</span>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="modal-issued-date-input">Thời gian phát hành hoá đơn</label>
            <input class="form-control" id="modal-issued-date-input" type="text" name="datetimes" style="height: 34px;" placeholder="HH : mm  dd / mm / yyyy"/>
        </div>

        <div class="form-group">
            <label for="modal-invoice-description-input">Mô tả</label>
            <textarea class="form-control" id="modal-invoice-description-input" rows="10" placeholder="Nhập mô tả chi tiết các khoản chi phí hoặc sản phẩm/dịch vụ đi kèm với hóa đơn"></textarea>
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
        e.target.value = utils.formatNumber(value); // Định dạng số với dấu chấm
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
        let amount = utils.getRawValue("#modal-invoice-amount-input");

        if (name === "") {
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên hoá đơn!"
            });
            return; 
        } 
        else if (!amount || isNaN(amount) || parseFloat(amount) <= 0){
            Toast.fire({
                icon: "error",
                title: "Số tiền không hợp lệ!"
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
                fileNames: [],
                images: []
            };
            // Xử lý file ảnh và chuyển đổi sang Base64
            var files = $('#fileUpload')[0].files;
            const base64Files = await Promise.all(Array.from(files).map(async file => {
                let base64 = await utils.imageToBase64(file);
                invoiceData.fileNames.push(file.name); // Lưu tên file vào mảng
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
                            title: "Đã thêm hoá đơn!",
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


// Nhấn nút "Cập nhật" để cập nhật hoá đơn  
$("#btn-update-invoice").on("click", function () {
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái 
    if (selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể cập nhật hoá đơn!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 2) { 
        Toast.fire({
            icon: "error",
            title: "Không thể cập nhật hoá đơn!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    }

    if (!selectedInvoice){
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn hoá đơn để thực hiện!",
        });
        return;
    }
    else {
        var invoiceId = selectedInvoice.id; // Lấy ID của hoá đơn
        utils.clear_modal();

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
                                <input type="text" class="form-control" id="modal-invoice-name-input" placeholder="Nhập tên quỹ" value="${invoice.name}">
                            </div>

                            <div class="form-group">
                                <label for="modal-invoice-amount-input">Số tiền</label>
                                <div class="input-group">
                                    <input id="modal-invoice-amount-input" type="text" class="form-control" aria-label="Số tiền (tính bằng đồng)" placeholder="Nhập số tiền" value="${utils.formatNumber(invoice.amount)}">
                                    <div class="input-group-append">
                                        <span class="input-group-text bg-primary text-white">₫</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="modal-issued-date">Thời gian phát hành hoá đơn</label>
                                <input class="form-control" id="modal-issued-date" type="text" name="datetimes" style="height: 34px;" placeholder="HH : mm  dd / mm / yyyy" value="${utils.formatDateTime(invoice.issuedDate)}"/>
                            </div>

                            <div class="form-group">
                                <label for="modal-invoice-description-input">Mô tả</label>
                                <textarea class="form-control" id="modal-invoice-description-input" rows="4" placeholder="Nhập mô tả chi tiết các khoản chi phí hoặc sản phẩm/dịch vụ đi kèm với hóa đơn">${invoice.description}</textarea>
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
                        e.target.value = utils.formatNumber(value); // Định dạng số với dấu chấm
                        } else {
                        e.target.value = '';
                        }
                    });

                    // Date Picker
                    $('#modal-issued-date').daterangepicker({
                        timePicker: true,
                        timePicker24Hour: true,
                        issuedTime: moment(invoice.issuedDate).startOf('hour'),
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

                                
                        existingImages.forEach(function (image, index) {
                            fileNamesHtml += `
                                <button type="button" class="btn btn-outline-light btn-file btn-sm" id="file-${index}" data-file-index="${index}">
                                    ${image.fileName}
                                    <span class="ml-2 close" data-file-index="${index}" style="font-size: small">&times;</span>
                                </button>
                            `;
                        });
                        

                        // Hiển thị danh sách tên file dưới dạng các button
                        $("#selected-file-names").html(fileNamesHtml);
                    });

                    // Xử lý sự kiện khi nhấn nút "x" để xoá file
                    $(document).on("click", ".close", function () {
                        var fileIndex = $(this).data('file-index');
                        var parentId = $(this).parent().attr('id');

                        // Kiểm tra xem file đang xoá là file mới hay file cũ
                        if (parentId && parentId.startsWith('file-')) {
                            // Đây là ảnh cũ, xoá khỏi mảng existingImages
                            existingImages.splice(fileIndex, 1);
                            // $(this).parent().remove();
                        } else {
                            // Đây là ảnh mới, xử lý như bình thường (xoá file khỏi input)
                            var inputFile = $('#fileUpload')[0];
                            var dt = new DataTransfer();
                            for (var i = 0; i < inputFile.files.length; i++) {
                                if (i !== fileIndex) {
                                    dt.items.add(inputFile.files[i]);
                                }
                            }
                            inputFile.files = dt.files;
                        }

                        // Xoá button tương ứng
                        $(this).parent().remove();
                    });

                    // Hiển thị các button hình ảnh đã lưu trước đó
                    var existingImages = []; // Mảng lưu trữ hình ảnh cũ đã tồn tại
                    var fileNamesHtml = '';
                    if (invoice.images && invoice.images.length > 0) {
                        invoice.images.forEach(function (image, index) {
                            fileNamesHtml += `
                                <button type="button" class="btn btn-outline-light btn-file btn-sm" id="file-${index}" data-file-index="${index}">
                                    ${image.fileName}
                                    <span class="ml-2 close" data-file-index="${index}" style="font-size: small">&times;</span>
                                </button>
                            `;
                            existingImages.push(image); // Lưu tên file vào mảng hình ảnh cũ
                        });
                    }
                    $("#selected-file-names").html(fileNamesHtml);
                    
                    $("#modal-id").modal("show");

                    // Cập nhật hoá đơn
                    $("#modal-update-btn").click( async function () {
                        let name = $("#modal-invoice-name-input").val();
                        let amount = utils.getRawValue("#modal-invoice-amount-input");
                        let description = $("#modal-invoice-description-input").val();
                        let issuedDate = issuedTime || invoice.issuedDate;                  
                        
                        if (issuedDate) {
                            issuedDate = moment(issuedDate).format('YYYY-MM-DD HH:mm:00');
                            console.log(issuedDate);  // In ra kết quả
                        }
                        if (name == null || name.trim() == "") {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng điền tên hoá đơn!"
                            });
                            return;
                        } 
                        else if (!amount || isNaN(amount) || parseFloat(amount) <= 0){
                            Toast.fire({
                                icon: "error",
                                title: "Số tiền không hợp lệ!"
                            });
                            return; 
                        } 
                        else {
                            Swal.showLoading();
                            // Chuẩn bị dữ liệu JSON để gửi
                            var invoiceData = {
                                name: name,
                                amount: amount,
                                issuedDate: issuedDate,
                                description: description,
                                paymentReq: selectedData.id,
                                fileNames: [],
                                images: []
                            };

                            // Thêm các hình ảnh cũ còn lại vào dữ liệu gửi
                            //invoiceData.fileNames.push(...existingImages);
                            existingImages.forEach(function (image) {
                                invoiceData.fileNames.push(image.fileName);
                                invoiceData.images.push(image.image); 
                            });

                            // Xử lý file ảnh và chuyển đổi sang Base64
                            var files = $('#fileUpload')[0].files;
                            const base64Files = await Promise.all(Array.from(files).map(async file => {
                                let base64 = await utils.imageToBase64(file);
                                invoiceData.fileNames.push(file.name); // Lưu tên file vào mảng
                                return base64.split(",")[1]; // Loại bỏ phần "data:image/*;base64,"
                            }));

                            // Thêm chuỗi Base64 của các file vào dữ liệu gửi
                            // invoiceData.images = base64Files;
                            invoiceData.images.push(...base64Files);

                            if (invoiceData.images.length === 0 && existingImages.length === 0) {
                                invoiceData.images = [];
                            }

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
                                            title: "Đã cập nhật hoá đơn!",
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
});


// Nhấn nút "Xoá" để xoá hoá đơn
$("#btn-remove-invoice").on("click", async function () {
    // Kiểm tra nếu đề nghị thanh toán đang ở trạng thái
    if (selectedData.status == 3 || selectedData.status == 4 || selectedData.status == 5) {
        Toast.fire({
            icon: "error",
            title: "Không thể xoá hoá đơn!",
            text: "Đề nghị thanh toán đã được xử lý",
        });
        return;
    }
    else if (selectedData.status == 2) { 
        Toast.fire({
            icon: "error",
            title: "Không thể xoá hoá đơn!",
            text: "Đề nghị thanh toán đã được gửi",
        });
        return;
    }

    if (!selectedInvoice){
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn hoá đơn để thực hiện!",
        });
        return;
    }
    else {
        var invoiceId = selectedInvoice.id; // Lấy ID của hoá đơn
        var name = selectedInvoice.name;

        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ xoá hoá đơn " + name,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Huỷ"
        });

        // Nếu người dùng không xác nhận, dừng việc xử lý
        if (!result.isConfirmed) {
            return;
        }

        // Thực hiện xoá hoá đơn
        await $.ajax({
            type: "DELETE",
            url: "/api/invoices?id=" + invoiceId,
            headers: utils.defaultHeaders(),
            beforeSend: function () {
                Swal.showLoading();
            },
            success: function (res) {
                Swal.close();
                if (res.code == 1000) {
                    Toast.fire({
                        icon: "success",
                        title: "Đã xoá hoá đơn!",
                    });
                    showDataTable(selectedData.id); // load lại bảng hoá đơn
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


// Nhấn nút "Trở về"
$("#btn-back-fund").click(function (){
    $("#invoices-wrapper").prop("hidden", true);
    $("#payment-wrapper").prop("hidden", false);
    dataTable.$('tr.selected').removeClass('selected');
    $("#btn-view-payment-request").click();
});