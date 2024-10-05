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
let selectedData; // Biến lưu dữ liệu quỹ đã chọn
var fundOption = [];
var transTypeOption = [];
var fundId;
var transTypeId;
var startDate;
var endDate;


$(document).ready(function () {
    // Date Range Picker
    $('input[name="datefilter"]').daterangepicker({
        autoUpdateInput: false,
        showDropdowns: true,
        linkedCalendars: false,
        locale: {
            cancelLabel: 'Huỷ',
            applyLabel: 'Áp dụng'
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

    // Nạp dữ liệu lên mảng fundOption
    // Gọi api để lấy tên quỹ
    $.ajax({
        type: "GET",
        url: "/api/funds/active",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let funds = res.result;
                let fundNameDropdown = $("#fund-select");
                fundOption = [];
                $('#fund-select').append("<option disabled selected >Chọn quỹ</option>");
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
    // Select "Tên quỹ"
    $('#fund-select').select2({
        placeholder: "Chọn quỹ",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    // Nạp dữ liệu lên mảng transTypeOption
    // Gọi api để lấy loại giao dịch
    $.ajax({
        type: "GET",
        url: "/api/transactionTypes/withdraw",
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let transactionTypes = res.result;
                let transactionTypeDropdown = $("#trans-type-select");
                transTypeOption = [];
                $('#trans-type-select').append("<option disabled selected >Chọn loại giao dịch</option>");
                
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
    // Select "Loại giao dịch"
    $('#trans-type-select').select2({
        placeholder: "Chọn loại giao dịch",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    // Bắt sự kiện khi chọn giá trị từ select
    $('#fund-select, #trans-type-select').on("change", function(){
        fundId = $('#fund-select').val(); // Lấy giá trị của select quỹ
        transTypeId = $('#trans-type-select').val(); // Lấy giá trị của select loại giao dịch
    });

    // Nhấn nút "Xem"
    $("#btn-view-withdraw").on("click", function () {    
        // Nếu không có giá trị thì gán ''
        fundId = fundId || '';
        transTypeId = transTypeId || '';
        startDate = startDate || ''; 
        endDate = endDate || ''; 
        
        if (fundId == '' && transTypeId == '' && startDate == '' && endDate == ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn quỹ hoặc loại giao dịch!",
            });
            return;
        }

        console.log("quỹ " + fundId);
        console.log("loại " + transTypeId);
        console.log("bắt đầu " + startDate);
        console.log("kết thúc " + endDate );
       
        // Gọi API với AJAX để lấy dữ liệu theo quỹ, loại giao dịch và khoảng thời gian
        $.ajax({
            url: "/api/fundTransactions/withdraw?fundId=" + fundId + "&transTypeId=" + transTypeId + "&startDate=" + startDate + "&endDate=" + endDate, // Đường dẫn API của bạn
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
                            amount: transaction.amount, 
                            description: transaction.description,
                            status: transaction.status,
                            transDate: formatDate(transaction.transDate),
                            trader: transaction.user.fullname,
                            fund: transaction.fund.fundName,
                            transactionType: transaction.transactionType.name,
                            id: transaction.id, // ID của transaction 
                        });
                    });
    
                    dataTable.clear().rows.add(data).draw();
                
                    // return data; // Trả về dữ liệu đã được xử lý
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
    dataTable = $('#transaction-withdraw-table').DataTable({
        fixedHeader: true,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        searching: true,
        ordering: true,
        lengthChange: true,
        responsive: true,
        dom: 'lrtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columnDefs: [
            {
                targets: '_all', // Áp dụng cho tất cả các cột
                className: 'text-center align-middle' // Căn giữa nội dung của tất cả các cột
            }
        ],

        columns: [
            { data: "number" },
            { data: "fund" },
            { data: "transactionType" },
            { data: "amount" },
            { data: "trader" },
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
        order: [[5, "asc"]], // Cột thứ 6 (transDate) sắp xếp tăng dần
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

// Bắt sự kiện khi chọn dòng
$('#transaction-withdraw-table tbody').on('click', 'tr', function () {
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
$("#btn-add-withdraw").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo giao dịch rút quỹ mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-fund-name">Tên quỹ</label>
            <select class="form-control" id="modal-fund-name" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal-transaction-type">Loại giao dịch</label>
            <select class="form-control" id="modal-transaction-type" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal-transaction-amount-input">Số tiền</label>
            <input type="text" class="form-control" id="modal-transaction-amount-input" placeholder="Nhập số tiền giao dịch">
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
        placeholder: "Chọn quỹ",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: fundOption
    })

    $('#modal-transaction-type').select2({
        placeholder: "Chọn loại giao dịch",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
        data: transTypeOption
    })

    // Đặt lại giá trị của select-dropdown về null
    $('#modal-fund-name').append("<option disabled selected >Chọn quỹ</option>");
    $('#modal-transaction-type').append("<option disabled selected >Chọn loại giao dịch</option>");

    $("#modal-id").modal("show");


    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(function () {
        let fund = $("#modal-fund-name").val();
        let transactionType = $("#modal-transaction-type").val();
        let amount = $("#modal-transaction-amount-input").val();
        let description = $("#modal-transaction-description-input").val();
    
        if(amount == null || amount.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập số tiền giao dịch!"
            });
            return;
        } else if (description == null || description.trim() == ""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập lý do rút quỹ!"
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
                $("#btn-view-withdraw").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
            });
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        var form = $('#modal-id')[0];
        if (form && typeof form.reset === 'function') {
            form.reset(); // Reset form nếu có
        } else {
            // Nếu không có form hoặc không hỗ trợ reset, xoá dữ liệu thủ công
            $('#modal-id').find('input, textarea, select').val('');
        }

        // Đóng modal
        $("#modal-id").modal('hide');
    });

});

// Nhấn nút "Xác nhận"
$("#btn-confirm-withdraw").on("click", function () {
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
                                <input type="text" class="form-control" id="modal-transaction-amount" value="${fundTransaction.amount}" readonly>
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
                                contentType: "application/json",
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
                                // Tải lại bảng chức năng
                                dataTable.ajax.reload();
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
                        }
                        $("#modal-id").modal("hide");
                        $("#modal-id").on('hidden.bs.modal', function () {
                            $("#btn-view-withdraw").click(); // Chỉ gọi sau khi modal đã hoàn toàn ẩn
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