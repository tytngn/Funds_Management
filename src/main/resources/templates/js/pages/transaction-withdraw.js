import * as utils from "/js/pages/utils.js";

// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
});

var dataTable;
let selectedData; // Biến lưu dữ liệu quỹ đã chọn
var token;

// Hiển thị bảng danh sách giao dịch rút quỹ
$(document).ready(function () {
    utils.introspect();
    // token = utils.getCookie('authToken');
    utils.setAjax();

    dataTable = $("#transaction-withdraw-table").DataTable({
        fixedHeader: true,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        searching: false,
        ordering: true,
        lengthChange: true,
        responsive: true,
        scrollX: 100,

        // Gọi AJAX đến server để lấy dữ liệu
        ajax: {
            url: "/api/fundTransactions", // Đường dẫn API
            type: "GET",
            dataType: "json",
            dataSrc: function (res) {
                if (res.code == 1000) {
                    console.log("success");
                    
                    var data = [];
                    var counter = 1;
                    res.result.forEach(function (transaction) {
                        if (transaction.transactionType.status === 0) {
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
                        }
                    });
                
                    return data; // Trả về dữ liệu đã được xử lý
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
            { data: "fund" },
            { data: "transactionType" },
            { data: "amount" },
            { data: "description" },
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

// Nhấn nút "Thêm mới"
$("#btn-add-withdraw").on("click", function () {
    clear_modal();
  
    $("#modal-title").text("Tạo giao dịch rút quỹ mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal_fund_name">Tên quỹ</label>
            <select class="form-control" id="modal_fund_name" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal_transaction_type">Loại giao dịch</label>
            <select class="form-control" id="modal_transaction_type" style="width: 100%;"></select>
        </div>

        <div class="form-group">
            <label for="modal_transaction_amount_input">Số tiền</label>
            <input type="text" class="form-control" id="modal_transaction_amount_input" placeholder="Nhập số tiền giao dịch">
        </div>

        <div class="form-group">
            <label for="modal_transaction_description_input">Ghi chú</label>
            <textarea class="form-control" id="modal_transaction_description_input" rows="4"></textarea>
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

    $('#modal_fund_name').select2({
        placeholder: "Chọn quỹ",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    })

    $('#modal_transaction_type').select2({
        placeholder: "Chọn loại giao dịch",
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    })

    // Đặt lại giá trị của select-dropdown về null
    $('#modal_fund_name').append("<option disabled selected >Chọn quỹ</option>");
    $('#modal_transaction_type').append("<option disabled selected >Chọn loại giao dịch</option>");

    $("#modal-id").modal("show");

    // Gọi api để lấy tên quỹ
    $.ajax({
        type: "GET",
        url: "/api/funds",
        success: function (res) {
            if (res.code === 1000) {
                let funds = res.result;
                let fundNameDropdown = $("#modal_fund_name");
                
                // Thêm các quỹ vào dropdown
                funds.forEach(function(fund) {
                    // Nếu quỹ đang hoạt động
                    if (fund.status === 1) {
                        fundNameDropdown.append(`
                            <option value="${fund.id}">${fund.fundName}</option>
                        `);
                    }
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách quỹ<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: "Lỗi! Không thể lấy danh sách quỹ",
            });
        }
    });

    // Gọi api để lấy loại giao dịch
    $.ajax({
        type: "GET",
        url: "/api/transactionTypes",
        success: function (res) {
            if (res.code === 1000) {
                let transactionTypes = res.result;
                let transactionTypeDropdown = $("#modal_transaction_type");
                
                // Thêm các loại giao dịch vào dropdown
                transactionTypes.forEach(function(transactionType) {
                    if(transactionType.status === 0){
                        transactionTypeDropdown.append(`
                            <option value="${transactionType.id}">${transactionType.name}</option>
                        `);
                    }
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Không thể lấy danh sách loại giao dịch<br>" + res.message,
                });
            }
        },
        error: function (xhr, status, error) {
            Toast.fire({
                icon: "error",
                title: "Lỗi! Không thể lấy danh sách loại giao dịch",
            });
        }
    });

    // Lưu thông tin giao dịch
    $("#modal-submit-btn").click(function () {
        let fund = $("#modal_fund_name").val();
        let transactionType = $("#modal_transaction_type").val();
        let amount = $("#modal_transaction_amount_input").val();
        let description = $("#modal_transaction_description_input").val();
    
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
                contentType: "application/json",
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
                    // Tải lại bảng chức năng
                    dataTable.ajax.reload();

                    // Reset form 
                    var form = $('#modal-id')[0];
                    if (form && typeof form.reset === 'function') {
                        form.reset(); // Reset form nếu có
                    } else {
                        // Nếu không có form hoặc không hỗ trợ reset, xoá dữ liệu thủ công
                        $('#modal-id').find('input, textarea, select').val('');
                    }

                    // Đóng modal
                    $("#modal-id").modal('hide');
                },
                error: function (xhr, status, error) {
                    Toast.fire({
                        icon: "error",
                        title: "Lỗi! Thực hiện không thành công",
                    });
                },
            });
            $("#modal_id").modal("hide");
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
                                <label for="modal_fund_name_input">Tên quỹ</label>
                                <input type="text" class="form-control" id="modal_fund_name_input" value="${fundTransaction.fund.fundName}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_transaction_type">Loại giao dịch</label>
                                <input type="text" class="form-control" id="modal_transaction_type" value="${fundTransaction.transactionType.name}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_transaction_amount">Số tiền</label>
                                <input type="text" class="form-control" id="modal_transaction_amount" value="${fundTransaction.amount}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_transaction_time">Thời gian giao dịch</label>
                                <input type="text" class="form-control" id="modal_transaction_time" value="${formatDate(fundTransaction.transDate)}" readonly>
                            </div>

                            <div class="form-group">
                                <label for="modal_transaction_description">Mô tả</label>
                                <textarea class="form-control" id="modal_transaction_description" rows="4" readonly>${fundTransaction.description}</textarea>
                            </div>

                            <div class="form-group row">
                                <div class="col-sm-6">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input ml-0" name="modal_transaction_status" id="approve" value="approve">
                                        <label class="form-check-label">Duyệt</label>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input ml-0" name="modal_transaction_status" id="reject" value="reject">
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
                        let transactionStatus = $("input[name='modal_transaction_status']:checked").val();
    
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
                                Toast.fire({
                                    icon: "error",
                                    title: "Lỗi! Thực hiện không thành công",
                                });
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
                    title: "Không thể lấy thông tin giao dịch<br>" + res.message,
                    });
                }
            },
            error: function (xhr, status, error) {
                Toast.fire({
                icon: "error",
                title: "Lỗi! Không thể lấy thông tin giao dịch",
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