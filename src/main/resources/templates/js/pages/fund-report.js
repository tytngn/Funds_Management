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

var startDate;
var endDate;

var name;

$(document).ready(async function () {
    const userInfo = await utils.getUserInfo(); // Lấy thông tin người dùng từ localStorage 
    name = userInfo.fullname;

    // Select 
    $('.select2').select2({
        allowClear: true,
        theme: "bootstrap",
        closeOnSelect: true,
    });

    // Bắt sự kiện thay đổi giá trị select "Loại bộ lọc"
    $('#filter-type-select').on('change', function() {
        var filterType = $(this).val();

        // Ẩn tất cả các trường trước
        $('#year-div').prop("hidden", true);
        $('#month-div').prop("hidden", true);
        $('#times-div').prop("hidden", true);

        // Clear lựa chọn của select
        $('#year-select').val(null).trigger('change');
        $('#month-select').val(null).trigger('change');

        // Clear giá trị Date Range Picker
        $('input[name="datetimes"]').val('').data('daterangepicker').setStartDate(moment());
        $('input[name="datetimes"]').data('daterangepicker').setEndDate(moment());

        // Hiển thị trường tương ứng với loại bộ lọc đã chọn
        if (filterType === 'year') {
            $('#year-div').prop("hidden", false); 
        } 
        else if (filterType === 'month') {
            $('#year-div').prop("hidden", false); 
            $('#month-div').prop("hidden", false); 
        }
        else if (filterType === 'time') {
            $('#times-div').prop("hidden", false); 
        }
    });

    // Tạo các option cho năm
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById("year-select");
    for (let year = 2020; year <= currentYear; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    }

    // Tạo các option cho tháng
    const monthSelect = document.getElementById("month-select");
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement("option");
        option.value = month;
        option.text = `Tháng ${month}`;
        monthSelect.appendChild(option);
    }


    // Date Range Picker
    $('input[name="datetimes"]').daterangepicker({
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
    $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
        // Hiển thị lên ô input
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

        startDate = picker.startDate.format('YYYY-MM-DD');
        endDate = picker.endDate.format('YYYY-MM-DD');
    });
    // Nút "Huỷ" trong Date Range Picker
    $('input[name="datetimes"]').on('cancel.daterangepicker', function(ev, picker) {
        startDate = '';
        endDate = '';
        $(this).val('');
    });


    // Nhấn nút "Xem"
    $("#btn-search").on("click", async function () {    
        await loadFundReport();
    });


    // Bảng báo cáo tổng quan quỹ
    dataTable = $("#fund-report-table").DataTable({
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
        searching: false,
        ordering: true,
        info: true,
        lengthChange: true,
        responsive: true,
        scrollX: true,        // Đảm bảo bảng có thể cuộn ngang
        scrollCollapse: true, // Khi bảng có ít dữ liệu, không cần thêm khoảng trống
        dom: 'frtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

        buttons: [
            {
                extend: 'pdfHtml5',
                title: 'BÁO CÁO TỔNG QUAN',
                orientation: 'landscape',
                pageSize: 'A4',
                exportOptions: {
                    columns: ':visible'  // Chọn tất cả các cột sẽ xuất
                },
                customize: function (doc) {
                    // Thiết lập chiều rộng cho các cột trong PDF
                    // doc.content[1].table.widths = Array(doc.content[1].table.body[0].length).fill('*'); // Cập nhật chiều rộng cột tự động
                    doc.content[1].table.widths = ['3%', '*', '10%', '10%', '10%', '10%', '10%', '12%'];

                    // Tạo lại cấu trúc bảng với border
                    const body = [];
                    body.push(doc.content[1].table.body[0]); // Hàng đầu tiên là tiêu đề

                    // Duyệt qua từng hàng và cột để cấu trúc lại
                    for (let i = 1; i < doc.content[1].table.body.length; i++) {
                        const row = doc.content[1].table.body[i];
                        const newRow = row.map((cell, index) => ({
                            text: cell.text || '', // Giữ lại nội dung
                            alignment: index === 1 || index === 7 ? 'left' : (index === 2 || index === 3 || index === 4 || index === 5 ? 'right' : 'center'), // Căn lề
                            border: [true, true, true, true] // Thiết lập border cho từng ô
                        }));
                        body.push(newRow);
                    }

                    // Gán lại body cho bảng
                    doc.content[1].table.body = body;

                    // Thêm ngày xuất file dưới tiêu đề
                    const date = new Date().toLocaleDateString('vi-VN', {
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit'
                    });

                    const filterType = $('#filter-type-select').val();
                    let reportTime = '';
                    if (filterType === 'year') {
                        reportTime = 'Năm ' + $('#year-select').val();
                    } else if (filterType === 'month') {
                        reportTime = 'Tháng ' + $('#month-select').val() + ' Năm ' + $('#year-select').val();
                    } else if (filterType === 'time') {
                        reportTime = 'Từ ' + utils.formatDate(startDate) + ' đến ' + utils.formatDate(endDate);
                    }

                    doc.content.splice(1, 0, { text: '' + reportTime, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] });
                    doc.content.splice(2, 0, { text: 'Ngày: ' + date, alignment: 'right', margin: [0, 5, 0, 5] });

                    // Thêm dữ liệu tổng vào cuối bảng
                    const totalBeginningBalance = document.getElementById("total-beginning-balance").innerText;
                    const totalIncome = document.getElementById("total-income").innerText;
                    const totalExpenditure = document.getElementById("total-expenditure").innerText;
                    const totalRemainingBalance = document.getElementById("total-remaining-balance").innerText;

                    doc.content.push(
                        { text: 'Tổng số dư đầu kỳ: ' + totalBeginningBalance, alignment: 'left', margin: [0, 30, 0, 3], bold: true },
                        { text: 'Tổng thu: ' + totalIncome, alignment: 'left', margin: [0, 5, 0, 3], bold: true },
                        { text: 'Tổng chi: ' + totalExpenditure, alignment: 'left', margin: [0, 5, 0, 3], bold: true },
                        { text: 'Tổng chi: ' + totalRemainingBalance, alignment: 'left', margin: [0, 5, 0, 0], bold: true }
                    );

                    doc.content.push(
                        {
                            text: 'Người lập báo cáo', 
                            alignment: 'right',
                            margin: [0, 30, 0, 20],
                        }
                    );
                    doc.content.push(
                        {
                            text: '' + name, 
                            alignment: 'right',
                            margin: [0, 20, 6, 0],
                        }
                    );
                }
            }
        ],

        columnDefs: [
            {
                targets: [0, 6], 
                className: 'text-center align-middle' 
            },
            {
                targets: [2, 3, 4, 5], 
                className: 'text-right align-middle' 
            }
        ],

        columns: [
            { data: "number" },
            { data: "fundName" },
            { data: "beginningBalance", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "income", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "expense", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "remainingBalance", 
                render: function (data, type, row) {
                    if (type === "display" || type === "filter") {
                        return utils.formatCurrency(data);
                    }
                    // Trả về giá trị nguyên gốc cho sorting và searching
                    return new Date(data);
                }
            },
            { data: "contributorsCount" },
            { 
                data: "status",
                orderable: true, // Cho phép sắp xếp dựa trên cột này
                searchable: true, // Cho phép tìm kiếm dựa trên cột này
                render: function (data, type, row) {
                    return data === 1 ? 'Hoạt động' : 'Ngừng hoạt động';
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


// Gọi api lấy dữ liệu báo cáo tổng quan
async function loadFundReport() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var filter = $('#filter-type-select').val();
    var year = '';
    var month = '';

    if (!filter){
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
                title: "Vui lòng chọn từ ngày đến ngày!",
            });
            return;
        }
    }
    else if (filter === 'year') {
        year = $('#year-select').val() || ''; 
        if (year === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn năm!",
            });
            return;
        }
    } 
    else if (filter === 'month') {
        year = $('#year-select').val() || ''; 
        month = $('#month-select').val() || '';
        if (year === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn năm!",
            });
            return;
        }
        else if (month === ''){
            Toast.fire({
                icon: "warning",
                title: "Vui lòng chọn tháng!",
            });
            return;
        }
    } 
    Swal.showLoading();
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    await $.ajax({
        url: "/api/funds/report?start=" + startDate + "&end=" + endDate + "&year=" + year + "&month=" + month, 
        type: "GET",
        headers: utils.defaultHeaders(),
        success: function(res) {
            Swal.close();
            if (res.code == 1000) {  
                // Cập nhật giá trị totalAmount vào thẻ h3
                $('#total-amount-div').prop("hidden", false);
                document.getElementById("total-beginning-balance").innerText = utils.formatCurrency(res.result.totalBeginningBalance);
                document.getElementById("total-income").innerText = utils.formatCurrency(res.result.totalIncome);
                document.getElementById("total-expenditure").innerText = utils.formatCurrency(res.result.totalExpenditure);
                document.getElementById("total-remaining-balance").innerText = utils.formatCurrency(res.result.totalRemainingBalance);

                var data = [];
                var counter = 1;
                res.result.report.forEach(function (rp) {
                    data.push({
                        number: counter++, // Số thứ tự tự động tăng
                        totalBeginningBalance: res.result.totalBeginningBalance,
                        totalIncome: res.result.totalIncome,
                        totalExpenditure: res.result.totalExpenditure,
                        totalRemainingBalance: res.result.totalRemainingBalance,

                        fundName: rp.fundName,
                        beginningBalance: rp.beginningBalance,
                        income: rp.income,
                        expense: rp.expense,
                        remainingBalance: rp.remainingBalance,
                        contributorsCount: rp.contributorsCount,
                        status: rp.status
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


// Xuất Excel
function exportTableToExcel() {
    const workbook = XLSX.utils.book_new();

    const date = new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const filterType = $('#filter-type-select').val();
    let reportTime = '';
    if (filterType === 'year') {
        reportTime = 'Năm ' + $('#year-select').val();
    } else if (filterType === 'month') {
        reportTime = 'Tháng ' + $('#month-select').val() + ' Năm ' + $('#year-select').val();
    } else if (filterType === 'time') {
        reportTime = 'Từ ' + utils.formatDate(startDate) + ' đến ' + utils.formatDate(endDate);
    }

    // Dữ liệu cho các dòng tiêu đề
    const titleData = [
        ["BÁO CÁO TỔNG QUAN"],
        [`Thời gian báo cáo: ${reportTime}`],
        [`Người xuất báo cáo: ${name}`],
        [`Ngày xuất báo cáo: ${date}`],
        []
    ];

    // Tạo worksheet từ tiêu đề
    const worksheet = XLSX.utils.aoa_to_sheet(titleData);
    
    // Hợp nhất các ô từ A1 đến D4
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // A1:H1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // A2:H2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // A3:H3
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }, // A4:H4
    ];

    // Trích xuất dữ liệu từ bảng HTML
    const table = document.getElementById("fund-report-table");
    const tableData = [];
    for (let row of table.rows) {
        const rowData = [];
        for (let cell of row.cells) {
            rowData.push(cell.innerText);
        }
        tableData.push(rowData);
    }

    XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: "A5" });

    // Thêm dòng dữ liệu tổng sau bảng
    const totalBeginningBalance = document.getElementById("total-beginning-balance").innerText;
    const totalIncome = document.getElementById("total-income").innerText;
    const totalExpenditure = document.getElementById("total-expenditure").innerText;
    const totalRemainingBalance = document.getElementById("total-remaining-balance").innerText;
    

    const summaryData = [
        [], // Dòng trống
        ["Tổng cộng", "", "", "", "", "", "", "", ""],
        ["Tổng số dư đầu kỳ", totalBeginningBalance],
        ["Tổng thu", totalIncome],
        ["Tổng chi", totalExpenditure],
        ["Tổng tồn", totalRemainingBalance]
    ];

    XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: `A${tableData.length + 6}` });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo tổng quan");
    XLSX.writeFile(workbook, "Bao_cao_tong_quan.xlsx");
}


$("#btn-export-excel").on("click", function () {
    exportTableToExcel();
});


$("#btn-export-pdf").on("click", function () {
    dataTable.button('.buttons-pdf').trigger();
});