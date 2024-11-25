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

$(document).ready(function () {

    // Nhấn nút "Xem"
    $("#btn-view-transaction-type").on("click", async function () {    
        await loadTransactionTypeData();
    });


    // Bảng thông tin loại giao dịch
    dataTable = $("#transaction-type-table").DataTable({
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
        ordering: true,
        info: true,
        lengthChange: true,
        responsive: true,
        scrollX: true,        // Đảm bảo bảng có thể cuộn ngang
        scrollCollapse: true, // Khi bảng có ít dữ liệu, không cần thêm khoảng trống
        dom: 'lrtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        columns: [
            { data: "number", className: "text-center"},
            { data: "name" },
            { data: "status", 
                render: function (data, type, row) {
                    // Xử lý các trạng thái
                    if (data == 0){
                        return "Rút quỹ";
                    }
                    else if (data == 1){
                        return "Đóng góp quỹ";
                    }
                }
            }
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

// Gọi api lấy dữ liệu danh sách các loại giao dịch
async function loadTransactionTypeData() {
    Swal.showLoading();
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    await $.ajax({
        url: "/api/transaction-types", 
        type: "GET",
        headers: utils.defaultHeaders(),
        success: function(res) {
            Swal.close();
            if (res.code == 1000) {  
                var data = [];
                var counter = 1;
                res.result.forEach(function (transType) {
                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        name: transType.name,
                        status: transType.status,
                        id: transType.id, // ID của loại giao dịch
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
$('#transaction-type-table tbody').on('click', 'tr', function () {
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


// Nhấn nút "Thêm mới"
$("#btn-add-transaction-type").on("click", function () {
    utils.clear_modal();
  
    $("#modal-title").text("Tạo loại giao dịch mới");
  
    $("#modal-body").append(`
        <div class="form-group">
            <label for="modal-name-input">Tên loại giao dịch</label>
            <input type="text" class="form-control" id="modal-name-input" placeholder="Nhập tên loại giao dịch">
        </div>
        <div class="form-group">
            <label for="modal-status-input">Thuộc giao dịch</label>
            <select class="form-control" id="modal-status-input" style="width: 100%;" data-placeholder="Chọn giao dịch">
                <option value="" disabled selected>Chọn giao dịch</option>
                <option value="1">Đóng góp quỹ</option>
                <option value="0">Rút quỹ</option>
            </select>
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

    $('#modal-status-input').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    $("#modal-id").modal("show");


    // Lưu thông tin loại giao dịch
    $("#modal-submit-btn").click(function () {
        let name = $("#modal-name-input").val();
        let status = $("#modal-status-input").val();
        if(name == null || name.trim()==""){
            Toast.fire({
                icon: "error",
                title: "Vui lòng nhập tên loại giao dịch!"
            });
            return;
        } 
        else if(status == null){
            Toast.fire({
                icon: "error",
                title: "Vui lòng chọn giao dịch!"
            });
            return;
        } 
        else {
            Swal.showLoading();
            $.ajax({
                type: "POST",
                url: "/api/transaction-types",
                headers: utils.defaultHeaders(),
                data: JSON.stringify({
                    name: name,
                    status: status
                }),
                success: async function (res) {
                    Swal.close();
                    if(res.code==1000){
                        await loadTransactionTypeData();                    
                        Toast.fire({
                            icon: "success",
                            title: "Đã thêm loại giao dịch!",
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
        }
    });

    // Khi nhấn nút "Huỷ bỏ"
    $("#modal-cancel-btn").click(function (){
        // Đóng modal
        $("#modal-id").modal('hide');
    });

});


// Nhấn nút "Cập nhật"
$("#btn-update-transaction-type").on("click", function () {
    if(selectedData){
        var transTypeId = selectedData.id; // Lấy ID của loại giao dịch
        utils.clear_modal();
        Swal.showLoading();

        // Gọi API lấy thông tin 
        $.ajax({
            type: "GET",
            url: "/api/transaction-types/" + transTypeId,
            headers: utils.defaultHeaders(),
            success: function (res) {
                Swal.close();
                if (res.code === 1000) {
                    let transactionType = res.result;
                    
                    $("#modal-title").text("Cập nhật loại giao dịch");
                    
                    // Hiển thị dữ liệu loại giao dịch trong modal
                    $("#modal-body").append(`
                        <form class="forms-sample">
                            <div class="form-group">
                                <label for="modal-name-input">Tên loại giao dịch</label>
                                <input type="text" class="form-control" id="modal-name-input" placeholder="Nhập tên loại giao dịch" value="${transactionType.name}">
                            </div>
                            <div class="form-group">
                                <label for="modal-status-input">Thuộc giao dịch</label>
                                <select class="form-control" id="modal-status-input" style="width: 100%;" data-placeholder="Chọn giao dịch">
                                    <option value="" disabled selected>Chọn giao dịch</option>
                                    <option value="1">Đóng góp quỹ</option>
                                    <option value="0">Rút quỹ</option>
                                </select>
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
                    
                    $('#modal-status-input').select2({
                        allowClear: true,
                        theme: "bootstrap",
                        closeOnSelect: true,
                    });
                    $('#modal-status-input').val(transactionType.status).trigger('change');

                    $("#modal-id").modal("show");

                    // Cập nhật loại giao dịch
                    $("#modal-update-btn").click(function () {
                        let name = $("#modal-name-input").val();
                        let status = $("#modal-status-input").val();

                        if (name == null || name.trim() == "") {
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng nhập tên loại giao dịch!"
                            });
                            return;
                        } 
                        else if(status == null){
                            Toast.fire({
                                icon: "error",
                                title: "Vui lòng chọn giao dịch!"
                            });
                            return;
                        } 
                        else {
                            Swal.showLoading();
                            $.ajax({
                                type: "PUT",
                                url: "/api/transaction-types/" + transTypeId,
                                headers: utils.defaultHeaders(),
                                data: JSON.stringify({
                                    name: name,
                                    status: status
                                }),
                                success: async function (res) {
                                    Swal.close();
                                    if (res.code == 1000) {
                                        await loadTransactionTypeData();  
                                        Toast.fire({
                                            icon: "success",
                                            title: "Đã cập nhật loại giao dịch!",
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
                        title: "Không thể lấy thông tin loại giao dịch<br>" + res.message,
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
            title: "Vui lòng chọn loại giao dịch để thực hiện!",
        });
    }
});


// Nhấn nút "Xoá"
$("#btn-remove-transaction-type").on("click", async function () {
    if (selectedData) {
        var transTypeId = selectedData.id; // Lấy ID của loại giao dịch

        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ xoá loại giao dịch " + selectedData.name,
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
        await $.ajax({
            type: "DELETE",
            url: "/api/transaction-types/" + transTypeId,
            headers: utils.defaultHeaders(),
            success: async function (res) {
                Swal.close();
                if (res.code == 1000) {
                    await loadTransactionTypeData();  
                    Toast.fire({
                        icon: "success",
                        title: "Đã xoá loại giao dịch!",
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
    else {
        Toast.fire({
            icon: "error",
            title: "Vui lòng chọn loại giao dịch để thực hiện!",
        });
    }
});
