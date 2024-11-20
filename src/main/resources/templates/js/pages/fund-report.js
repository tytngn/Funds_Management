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

var userRole;
var name;

$(document).ready(async function () {
    await setData(); 

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


    var urlFund = "/api/funds/by-treasurer";
    if (userRole === 'ADMIN' || userRole === 'ACCOUNTANT'){
        urlFund = "/api/funds/active";
    } 
    // Gọi api để lấy tên quỹ 
    $.ajax({
        type: "GET",
        url: urlFund,
        headers: utils.defaultHeaders(),
        success: function (res) {
            if (res.code === 1000) {
                let funds = res.result;
                let fundNameDropdown = $("#fund-select");

                // Thêm các quỹ vào dropdown
                funds.forEach(function(fund) {
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

    // Nhấn nút "Tìm kiếm"
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
        dom: 'lfrtip', // Ẩn thanh tìm kiếm mặc định (l: length, r: processing, t: table, i: information, p: pagination)

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

                    // Thêm hàng "TỔNG CỘNG" vào cuối bảng
                    const totalBeginningBalance = document.getElementById("total-beginning-balance").innerText;
                    const totalIncome = document.getElementById("total-income").innerText;
                    const totalExpenditure = document.getElementById("total-expenditure").innerText;
                    const totalRemainingBalance = document.getElementById("total-remaining-balance").innerText;
                    body.push([
                        { text: '', border: [true, true, true, true] },
                        { text: 'TỔNG CỘNG:', bold: true, alignment: 'right', border: [true, true, true, true] },
                        { text: totalBeginningBalance, bold: true, alignment: 'right', border: [true, true, true, true] },
                        { text: totalIncome, bold: true, alignment: 'right', border: [true, true, true, true] },
                        { text: totalExpenditure, bold: true, alignment: 'right', border: [true, true, true, true] },
                        { text: totalRemainingBalance, bold: true, alignment: 'right', border: [true, true, true, true] },
                        { text: '', border: [true, true, true, true] },
                        { text: '', border: [true, true, true, true] }
                    ]);

                    // Gán lại body cho bảng
                    doc.content[1].table.body = body;

                    const filterType = $('#filter-type-select').val();
                    let reportTime = '';
                    if (filterType === 'year') {
                        reportTime = 'Năm ' + $('#year-select').val();
                    } else if (filterType === 'month') {
                        reportTime = 'Tháng ' + $('#month-select').val() + ' Năm ' + $('#year-select').val();
                    } else if (filterType === 'time') {
                        reportTime = 'Từ ' + utils.formatDate(startDate) + ' đến ' + utils.formatDate(endDate);
                    }

                    // Xóa tiêu đề mặc định nếu có
                    if (doc.content[0].text && doc.content[0].text === 'BÁO CÁO TỔNG QUAN') {
                        doc.content.shift(); // Xóa phần tử đầu tiên
                    }

                    // Thêm ngày xuất file và các thông tin khác
                    const date = new Date();

                    // Thêm tên công ty và địa chỉ bên trái, ngày tháng năm bên phải
                    doc.content.unshift({
                        columns: [
                            { 
                                stack: [
                                    { text: "TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM", margin: [35, 0, 0, 5] },
                                    { text: "VIỄN THÔNG HẬU GIANG", margin: [80, 0, 0, 5] },
                                    { text: "TRUNG TÂM CÔNG NGHỆ THÔNG TIN", bold: true, margin: [50, 0, 0, 5] },
                                    { text: "Số 61, đường Võ Văn Kiệt, phường V, thành phố Vị Thanh, tỉnh Hậu Giang", margin: [0, 0, 0, 0] }
                                ],
                                alignment: 'left', 
                                margin: [0, 0, 0, 10] 
                            },
                            { 
                                text: `Hậu Giang, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`,
                                alignment: 'right',
                                italics: true,
                                margin: [0, 45, 0, 0] 
                            }
                        ]
                    });  

                    // Thêm tiêu đề chính
                    doc.content.splice(1, 0, { 
                        text: 'BÁO CÁO TỔNG QUAN', 
                        fontSize: 16, 
                        bold: true, 
                        alignment: 'center', 
                        margin: [10, 20, 0, 10] 
                    });

                    // Thêm thông tin báo cáo
                    doc.content.splice(2, 0, { text: '' + reportTime, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 20] });

                    // Thêm chữ ký người lập báo cáo bên trái, kế toán bên phải
                    doc.content.push({
                        columns: [
                            {
                                text: 'Người lập báo cáo', 
                                alignment: 'left',
                                margin: [10, 30, 0, 0]
                            },
                            {
                                text: 'Kế toán', 
                                alignment: 'right',
                                margin: [0, 30, 25, 0]
                            }
                        ]
                    });
                    doc.content.push({
                        columns: [
                            {
                                text: '(Ký và ghi rõ họ tên)', 
                                alignment: 'left',
                                margin: [10, 5, 0, 35],
                                italics: true
                            },
                            {
                                text: '(Ký và ghi rõ họ tên)', 
                                alignment: 'right',
                                margin: [0, 5, 0, 35],
                                italics: true
                            }
                        ]
                    });
                    doc.content.push({
                        columns: [
                            {
                                text: '' + name, 
                                alignment: 'left',
                                margin: [10, 0, 0, 0]
                            }
                        ]
                    });
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
                    return data === 1 ? '' : 'Ngừng hoạt động';
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


// Hiển thị dữ liệu theo role của người dùng
async function setData() {
    const userInfo = await utils.getUserInfo(); // Lấy thông tin người dùng từ localStorage 
    if (!userInfo) {
        throw new Error("Không thể lấy thông tin người dùng");
    }

    name = userInfo.fullname;
    const roles = userInfo.roles.map(role => role.id); // Lấy danh sách các role của user

    // Đối với Thủ quỹ
    if (roles.includes('USER_MANAGER')) {
        userRole = "USER_MANAGER";
    } 
    // Đối với Kế toán
    if (roles.includes('ACCOUNTANT')) {
        userRole = "ACCOUNTANT";
    } 
    // Đối với Quản trị viên
    if (roles.includes('ADMIN')) {
        userRole = "ADMIN";
    } 
}


// Gọi api lấy dữ liệu báo cáo tổng quan
async function loadFundReport() {
    // Nếu không có giá trị thì gán ''
    startDate = startDate || ''; 
    endDate = endDate || ''; 

    var fundId = $('#fund-select').val() || ''; // Lấy giá trị của select quỹ

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

    var urlReport = "/api/funds/report-by-treasurer?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&year=" + year + "&month=" + month;
    if (userRole === 'ADMIN' || userRole === 'ACCOUNTANT'){
        urlReport = "/api/funds/report?fundId=" + fundId + "&start=" + startDate + "&end=" + endDate + "&year=" + year + "&month=" + month;
    }

    Swal.showLoading();
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    await $.ajax({
        url: urlReport,
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
    const table = $("#fund-report-table").DataTable();
    const tableData = [];

    // Lấy dòng header
    const headerData = [];
    $('#fund-report-table thead th').each(function () {
        headerData.push($(this).text().trim());
    });
    tableData.push(headerData); // Thêm dòng header vào đầu mảng dữ liệu

    // Lấy tất cả các dòng trong DataTable (bao gồm cả các dòng không hiển thị)
    table.rows({ search: 'none' }).every(function () {
        const rowData = [];
        const row = this.node(); // Lấy dòng hiện tại
        $(row).find('td').each(function () {
            rowData.push($(this).text());
        });
        tableData.push(rowData);
    });

    XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: "A5" });

    // Tính toán vị trí bắt đầu của dòng tổng cộng
    const totalRowIndex = 5 + tableData.length;

    // Thêm dòng dữ liệu tổng sau bảng
    const totalBeginningBalance = document.getElementById("total-beginning-balance").innerText;
    const totalIncome = document.getElementById("total-income").innerText;
    const totalExpenditure = document.getElementById("total-expenditure").innerText;
    const totalRemainingBalance = document.getElementById("total-remaining-balance").innerText;
    
    // Thêm dòng Tổng cộng
    XLSX.utils.sheet_add_aoa(worksheet, [
        ["TỔNG CỘNG:", "", totalBeginningBalance, totalIncome, totalExpenditure, totalRemainingBalance, "", ""]
    ], { origin: `A${totalRowIndex}` });

    // Hợp nhất các ô 
    worksheet['!merges'].push({
        s: { r: totalRowIndex - 1, c: 0 }, // Ô A*
        e: { r: totalRowIndex - 1, c: 1 }  // Ô B*
    });

    // Định dạng lại chiều rộng cột (nếu cần)
    worksheet['!cols'] = [
        { wch: 5 },  // Cột A
        { wch: 50 }, // Cột B
        { wch: 20 }, // Cột C
        { wch: 20 }, // Cột D
        { wch: 20 }, // Cột E
        { wch: 20 }, // Cột F
        { wch: 20 }, // Cột G
        { wch: 20 } // Cột H
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo tổng quan");
    XLSX.writeFile(workbook, "Bao_cao_tong_quan.xlsx");
}



$("#btn-export-excel").on("click", function () {
    exportTableToExcel();
});


$("#btn-export-pdf").on("click", function () {
    dataTable.button('.buttons-pdf').trigger();
});