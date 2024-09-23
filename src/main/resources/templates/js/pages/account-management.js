// sử dụng SweetAlert2
var Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1000,
});

$(document).ready(function () {    
  $("#account-table").DataTable({
    processing: true,
    paging: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    responsive: true,
    ajax: {
      url: "/api/users", // Thay đổi URL với API của bạn
      type: "GET",
      dataSrc: function (res) {
        if (res.code == 1000) {
            console.log("success");
            
          var data = [];
          var counter = 1;
          res.result.forEach(function (user) {
              data.push({
                number: counter++, // Số thứ tự tự động tăng
                username: user.username, 
                email: user.email, 
                fullname: user.fullname,
                phone: user.phone,
                status: user.status,
                id: user.id, // ID của user (dùng cho cột Thao tác)
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
      error: function () {
        Toast.fire({
          icon: "error",
          title: "Internal server error",
        });
      },
    },
    columns: [
      { data: "number" },
      { data: "username" },
      { data: "email" },
      { data: "fullname" },
      { data: "phone" },
      { data: "status" },
    //   {
    //     data: "id",
    //     render: function (data, type, row) {
    //       return (
    //         '<center><a class="btn btn-info btn-sm" id="editBtn" data-id="' +
    //         data +
    //         '"><i class="fas fa-pencil-alt"></i></a>  <a class="btn btn-success btn-sm" data-id="' +
    //         data +
    //         '" id="activeBtn"><i class="fa-solid fa-user-check"></i></a> <a class="btn btn-danger btn-sm" data-id="' +
    //         data +
    //         '" id="deleteBtn"><i class="fa-solid fa-trash"></i></a></center>'
    //       );
    //     },
    //   },
    ],
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
  });
});
