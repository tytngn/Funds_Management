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
        scrollX: 50,
        // select: true,
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
            { data: "description" },
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
        dom: '<"d-flex justify-content-between"lf>t<"d-flex justify-content-between"ip>', // Tùy chỉnh DOM
    });
});

// Bắt sự kiện khi chọn dòng
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
                    $("#modal-update-btn").click(function () {
                        let name = $("#modal_fund_name_input").val();
                        let status = $("#modal_fund_status_input").is(":checked") ? 1 : 0;
                        let description = $("#modal_fund_description_input").val();
                    
                        if (name == null || name.trim() == "") {
                        Toast.fire({
                            icon: "error",
                            title: "Vui lòng điền tên quỹ!"
                        });
                        return;
                        } else {
                        $.ajax({
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
                    title: "Không thể lấy thông tin quỹ<br>" + res.message,
                    });
                }
            },
            error: function (xhr, status, error) {
                Toast.fire({
                icon: "error",
                title: "Lỗi! Không thể lấy thông tin quỹ",
                });
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

    $("#user-fund-wrapper").prop("hidden", false);
    $("#fund-wrapper").prop("hidden", true);

    // Cập nhật tên quỹ vào thẻ <h4>
    $("#title-fund").text(selectedData.fundName);

    // Gọi hàm showDataTable và truyền dữ liệu dòng đã chọn
    showDataTable(selectedData);

});

// Hàm hiển thị dataTable User: lấy tất cả người dùng được phép giao dịch với quỹ đó
function showDataTable(fund) {

    // Dữ liệu trong bảng
    $("#user-fund-table").DataTable({
        fixedHeader: true,
        processing: true,
        paging: true,
        pagingType: "simple_numbers",
        searching: false,
        ordering: true,
        lengthChange: true,
        responsive: true,
        // scrollX: 50,
        // select: true,
        // Gọi AJAX đến server để lấy dữ liệu
        ajax: {
            url: "/api/user-fund?fundId=" + fund.id, // Đường dẫn API
            type: "GET",
            dataType: "json",
            dataSrc: function (res) {
                if (res.code == 1000) {
                    console.log("success");
                    console.table(res.result);

                    var dataSet = [];
                    var stt = 1;

                    res.result.forEach(function (userFund){
                        dataSet.push({
                            number: stt++,
                            id: userFund.id,
                            fullname: userFund.fullname,
                            email: userFund.email,
                            status: userFund.status,
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
                            statusText = 'Chưa cấp quyền';
                            break;
                        case 1:
                            statusClass = 'btn-inverse-success';
                            statusText = 'Đóng góp';
                            break;
                        case 2:
                            statusClass = 'btn-inverse-warning';
                            statusText = 'Rút quỹ';
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

    
}




