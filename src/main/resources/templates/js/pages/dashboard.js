import * as utils from "/js/pages/services/utils.js";
utils.introspect();

// sử dụng SweetAlert2
var Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
});

var userRole;


$(document).ready(async function () {
    await setData();
    loadTotal(); 
    loadChart();    
    $.ajax({
        url: "/api/funds/details", 
        type: "GET",
        headers: utils.defaultHeaders(),
        beforeSend: function(){
            Swal.showLoading();
        },
        success: function (response) {
            Swal.close();
            if (response.code === 1000) {
                loadCarouselItems(response.result);
            } else {
                Toast.fire({
                    icon: "error",
                    title: response.message || "Error in fetching data",
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
});


// Hiển thị dữ liệu theo role của người dùng
async function setData() {
    const userInfo = await utils.getUserInfo(); // Lấy thông tin người dùng từ localStorage
    if (!userInfo) {
      throw new Error("Không thể lấy thông tin người dùng");
    }
  
    const roles = userInfo.roles.map((role) => role.id); // Lấy danh sách các role của user
  
    // Đối với Nhân viên
    if (roles.includes("USER")) {
      userRole = "USER";
    }
    // Đối với Thủ quỹ
    if (roles.includes("USER_MANAGER")) {
      userRole = "USER_MANAGER";
    }
    // Đối với Kế toán
    if (roles.includes("ACCOUNTANT")) {
      userRole = "ACCOUNTANT";
    }
    if (roles.includes("ADMIN")) {
      userRole = "ADMIN";
    }
}


function loadTotal(){
    $("#expenditure").prop("hidden", false);
    $("#balance").prop("hidden", false);

    var urlReport;
    if (userRole === "ADMIN" || userRole === "ACCOUNTANT") {
        urlReport = "/api/funds/month-report";
    }
    if (userRole === "USER_MANAGER") {
        urlReport = "/api/funds/treasurer-month-report";
    }
    if (userRole === "USER") {
        $("#expenditure").prop("hidden", true);
        $("#balance").prop("hidden", true);
        urlReport = "/api/fund-transactions/individual-month-report";
    }

    Swal.showLoading();   
    // Gọi API với AJAX để lấy dữ liệu theo bộ lọc
    $.ajax({
        url: urlReport,
        type: "GET",
        headers: utils.defaultHeaders(),
        success: function (res) {
            Swal.close();
            if (res.code == 1000) {
                document.getElementById("total-income").innerText = utils.formatCurrency(res.result.totalIncome);
                document.getElementById("total-expenditure").innerText = utils.formatCurrency(res.result.totalExpenditure);
                document.getElementById("total-payment").innerText = utils.formatCurrency(res.result.totalPayment);
                document.getElementById("total-balance").innerText = utils.formatCurrency(res.result.totalRemainingBalance);

                document.getElementById("total-contribute").innerText = res.result.totalContributions + " giao dịch";
                document.getElementById("total-withdraw").innerText = res.result.totalWithdrawals + " giao dịch";
                document.getElementById("total-payment-request").innerText = res.result.totalPaymentRequest + " đề nghị thanh toán";
            } else {
                Toast.fire({
                    icon: "error",
                    title: res.message || "Error in fetching data",
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close();
            if (xhr.status == 401 || xhr.status == 403) {
                Toast.fire({
                    icon: "error",
                    title: "Bạn không có quyền truy cập!",
                    timer: 1500,
                    didClose: function () {
                        window.location.href = "/";
                    },
                });
            }
        },
    });
}


function loadChart(){
    const currentYear = new Date().getFullYear(); // Lấy năm hiện tại    
    const description = document.getElementById('fund-description');
    $("#link").prop("hidden", false);
    description.textContent = 'Biểu đồ thể hiện tổng số tiền đóng góp quỹ, tổng số tiền rút quỹ và tổng số tiền thanh toán theo các tháng trong năm ' + currentYear;

    if (userRole === "USER") {
        $("#link").prop("hidden", true);
        description.textContent = 'Biểu đồ thể hiện tổng số tiền đóng góp quỹ và tổng số tiền đề nghị thanh toán theo các tháng trong năm ' + currentYear;

        // Load biểu đồ cột    
        if ($("#sales-chart").length) {
            $.ajax({
                url: "/api/fund-transactions/individual-monthly", 
                type: "GET",
                headers: utils.defaultHeaders(),
                beforeSend: function(){
                    Swal.showLoading();
                },
                success: function (response) {
                    Swal.close();
                    if (response.code == 1000) {
                        // Dữ liệu trả về từ API
                        const monthlyContributions = response.result.monthlyContributions || [];
                        const monthlyPayments = response.result.monthlyPayments || [];
        
                        // Danh sách 12 tháng cố định
                        const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
        
                        // Chuẩn hóa dữ liệu đóng góp và thanh toán
                        const contributionData = monthNames.map((_, index) => {
                            const monthData = monthlyContributions.find(item => item.month === index + 1);
                            return monthData ? monthData.totalAmount / 1000 : 0;
                        });
        
                        const paymentData = monthNames.map((_, index) => {
                            const monthData = monthlyPayments.find(item => item.month === index + 1);
                            return monthData ? monthData.totalPaymentAmount / 1000 : 0;
                        });
        
                        // Tạo biểu đồ
                        var SalesChartCanvas = $("#sales-chart").get(0).getContext("2d");
                        var SalesChart = new Chart(SalesChartCanvas, {
                            type: 'bar',
                            data: {
                                labels: monthNames, // Hiển thị đủ 12 tháng
                                datasets: [
                                    {
                                        label: 'Đóng góp (nghìn đồng)',
                                        data: contributionData,
                                        backgroundColor: '#4DB6AC'
                                    },
                                    {
                                        label: 'Thanh toán (nghìn đồng)',
                                        data: paymentData,
                                        backgroundColor: '#F3797E'
                                    }
                                ]
                            },
                            options: {
                                cornerRadius: 5,
                                responsive: true,
                                maintainAspectRatio: true,
                                layout: {
                                    padding: {
                                        left: 0,
                                        right: 0,
                                        top: 20,
                                        bottom: 0
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        display: true,
                                        gridLines: {
                                            display: true,
                                            drawBorder: false,
                                            color: "#F2F2F2"
                                        },
                                        ticks: {
                                            display: true,
                                            min: 0,
                                            callback: function (value) {
                                                // Format dữ liệu theo đơn vị tiền tệ Việt Nam
                                                return `${utils.formatCurrency(value * 1000)}`;
                                            },
                                            autoSkip: true,
                                            maxTicksLimit: 10,
                                            fontColor: "#6C7383"
                                        }
                                    }],
                                    xAxes: [{
                                        stacked: false,
                                        ticks: {
                                            beginAtZero: true,
                                            fontColor: "#6C7383"
                                        },
                                        gridLines: {
                                            color: "rgba(0, 0, 0, 0)",
                                            display: false
                                        },
                                        barPercentage: 1
                                    }]
                                },
                                legend: {
                                    display: true
                                },
                                elements: {
                                    point: {
                                        radius: 0
                                    }
                                }
                            },
                        });
        
                        // Cập nhật legend
                        document.getElementById('sales-legend').innerHTML = SalesChart.generateLegend();
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: response.message || "Error in fetching data",
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
    }
    else {
        var urlBar = "/api/fund-transactions/summary/by-treasurer";
        if (userRole === "ADMIN" || userRole === "ACCOUNTANT"){
            urlBar= "/api/fund-transactions/summary";          
        }
        // Load biểu đồ cột
        if ($("#sales-chart").length) {
            $.ajax({
                url: urlBar, 
                type: "GET",
                headers: utils.defaultHeaders(),
                beforeSend: function(){
                    Swal.showLoading();
                },
                success: function (response) {
                    Swal.close();
                    if (response.code == 1000) {
                        // Dữ liệu từ API
                        const contributions = response.result.contributions || [];
                        const payments = response.result.payments || [];
                        const withdrawals = response.result.withdrawals || [];
        
                        // Danh sách 12 tháng cố định
                        const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
        
                        // Chuẩn hóa dữ liệu
                        const contributionData = monthNames.map((_, index) => {
                            const monthData = contributions.find(item => item.month === index + 1);
                            return monthData ? monthData.totalContributionAmount / 1000 : 0;
                        });

                        const withdrawalData = monthNames.map((_, index) => {
                            const monthData = withdrawals.find(item => item.month === index + 1);
                            return monthData ? monthData.totalWithdrawAmount / 1000 : 0;
                        });
        
                        const paymentData = monthNames.map((_, index) => {
                            const monthData = payments.find(item => item.month === index + 1);
                            return monthData ? monthData.totalPaymentAmount / 1000 : 0;
                        });
        
                        // Vẽ biểu đồ
                        var SalesChartCanvas = $("#sales-chart").get(0).getContext("2d");
                        var SalesChart = new Chart(SalesChartCanvas, {
                            type: 'bar',
                            data: {
                                labels: monthNames, // Hiển thị đủ 12 tháng
                                datasets: [
                                    {
                                        label: 'Đóng góp (nghìn đồng)',
                                        data: contributionData,
                                        backgroundColor: '#4DB6AC',
                                        barPercentage: 1, // Điều chỉnh độ rộng của cột
                                        categoryPercentage: 1.5 // Điều chỉnh khoảng cách giữa các nhóm cột
                                    },
                                    {
                                        label: 'Rút quỹ (nghìn đồng)',
                                        data: withdrawalData,
                                        backgroundColor: '#FFE082',
                                        barPercentage: 1, // Điều chỉnh độ rộng của cột
                                        categoryPercentage: 1.5 // Điều chỉnh khoảng cách giữa các nhóm cột
                                    },
                                    {
                                        label: 'Thanh toán (nghìn đồng)',
                                        data: paymentData,
                                        backgroundColor: '#F3797E',
                                        barPercentage: 1, // Điều chỉnh độ rộng của cột
                                        categoryPercentage: 1.5 // Điều chỉnh khoảng cách giữa các nhóm cột
                                    }                                    
                                ]
                            },
                            options: {
                                cornerRadius: 5,
                                responsive: true,
                                maintainAspectRatio: true,
                                layout: {
                                    padding: {
                                        left: 0,
                                        right: 0,
                                        top: 20,
                                        bottom: 0
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        display: true,
                                        gridLines: {
                                            display: true,
                                            drawBorder: false,
                                            color: "#F2F2F2"
                                        },
                                        ticks: {
                                            display: true,
                                            min: 0,
                                            callback: function (value) {
                                                // Format dữ liệu theo đơn vị tiền tệ Việt Nam
                                                return `${utils.formatCurrency(value * 1000)}`;
                                            },
                                            autoSkip: true,
                                            maxTicksLimit: 10,
                                            fontColor: "#6C7383"
                                        }
                                    }],
                                    xAxes: [{
                                        stacked: false, // Các cột không chồng lên nhau
                                        ticks: {
                                            beginAtZero: true,
                                            fontColor: "#6C7383"
                                        },
                                        gridLines: {
                                            color: "rgba(0, 0, 0, 0)",
                                            display: false
                                        }
                                    }]
                                },
                                legend: {
                                    display: true
                                },
                                elements: {
                                    point: {
                                        radius: 0
                                    }
                                }
                            },
                        });
        
                        // Cập nhật legend
                        document.getElementById('sales-legend').innerHTML = SalesChart.generateLegend();
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: response.message || "Error in fetching data",
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
    }
}


function loadCarouselItems(data) {
    const month = new Date().getMonth(); // Lấy tháng hiện tại    
    const carouselContainer = $("#detailedReports .carousel-inner");
    carouselContainer.empty(); // Xóa nội dung cũ

    data.forEach((fund, index) => {
        const isActive = index === 0 ? "active" : "";
        const departmentsTableRows = fund.department
            .map((dept) => {
                const progressPercent = (
                    (dept.contributorsCount / dept.employeeCount) * 100
                ).toFixed(2);

                return `
                    <tr>
                        <td class="text-muted">${dept.name}</td>
                        <td class="w-100 px-0">
                            <div class="progress progress-md mx-4">
                                <div class="progress-bar bg-primary" role="progressbar" 
                                    style="width: ${progressPercent}%" 
                                    aria-valuenow="${progressPercent}" 
                                    aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                        </td>
                        <td>
                            <h5 class="font-weight-bold mb-0">${dept.contributorsCount}/${dept.employeeCount}</h5>
                        </td>
                    </tr>
                `;
            })
            .join("");

        const carouselItem = `
            <div class="carousel-item ${isActive}">
                <div class="row">
                    <div class="col-md-12 col-xl-3 d-flex flex-column justify-content-start">
                        <div class="ml-xl-4 mt-3">
                            <h3 class="card-title text-primary">${fund.fundName}</h3>
                            <p class="font-weight-500 mb-xl-4">${fund.description}</p>
                            <p class="mb-2 mb-xl-0">
                                Số dư trong tháng ${month + 1}: <strong>${utils.formatCurrency(fund.totalBalance)}</strong>
                            </p>
                        </div>
                    </div>
                    <div class="col-md-12 col-xl-9">
                        <div class="row">
                            <div class="col-md-6 border-right">
                                <div class="table-responsive mb-3 mb-md-0 mt-3">
                                    <table class="table table-borderless report-table">
                                        ${departmentsTableRows}
                                    </table>
                                </div>
                            </div>
                            <div class="col-md-6 mt-3">
                                <canvas id="chart-${index}"></canvas>
                                <div id="legend-${index}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        carouselContainer.append(carouselItem);

        // Vẽ biểu đồ cho từng quỹ
        drawPieChart(`chart-${index}`, fund);
    });
}

function drawPieChart(canvasId, fund) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Đóng góp", "Rút quỹ", "Thanh toán"],
            datasets: [
                {
                    data: [
                        fund.totalContribution,
                        fund.totalWithdrawal,
                        fund.totalPayment,
                    ],
                    backgroundColor: ["#4DB6AC", "#FFE082", "#F3797E"],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });
}
