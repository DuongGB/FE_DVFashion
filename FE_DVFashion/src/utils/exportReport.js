// Hàm xuất báo cáo dưới dạng in
export const handleExportReport = (reportData, selectedPeriod) => {
  const printContent = document.getElementById("analyst-report-content");

  // Tạo nội dung để in
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Báo cáo phân tích - DVFashion</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px 0;
            border-bottom: 2px solid #3b82f6;
          }
          
          .print-header h1 {
            color: #1f2937;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .print-header p {
            color: #6b7280;
            font-size: 14px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
            text-align: center;
          }
          
          .stat-card h3 {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 4px;
          }
          
          .stat-card .growth {
            font-size: 12px;
            color: #059669;
          }
          
          .table-container {
            margin-top: 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
          }
          
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }
          
          .status-completed {
            background: #d1fae5;
            color: #065f46;
          }
          
          .status-shipping {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .performance-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          
          .performance-card {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            background: #f9fafb;
          }
          
          .performance-card .metric {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .performance-card .label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .chart-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 10px;
            }
            
            @page {
              margin: 1cm;
              size: A4;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>BÁO CÁO PHÂN TÍCH KINH DOANH</h1>
          <p>DVFashion - ${new Date().toLocaleDateString(
            "vi-VN"
          )} - Kỳ báo cáo: ${
    selectedPeriod === "7days"
      ? "7 ngày qua"
      : selectedPeriod === "30days"
      ? "30 ngày qua"
      : selectedPeriod === "3months"
      ? "3 tháng qua"
      : "Năm nay"
  }</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Tổng doanh thu</h3>
            <div class="value">${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(reportData.revenue)}</div>
            <div class="growth">+${reportData.revenueGrowth}%</div>
          </div>
          <div class="stat-card">
            <h3>Tổng đơn hàng</h3>
            <div class="value">${reportData.totalOrders.toLocaleString()}</div>
            <div class="growth">+${reportData.orderGrowth}%</div>
          </div>
          <div class="stat-card">
            <h3>Sản phẩm</h3>
            <div class="value">${reportData.totalProducts}</div>
            <div class="growth">+${reportData.productGrowth}%</div>
          </div>
          <div class="stat-card">
            <h3>Khách hàng</h3>
            <div class="value">${reportData.totalCustomers.toLocaleString()}</div>
            <div class="growth">+${reportData.customerGrowth}%</div>
          </div>
        </div>

        <div class="table-container">
          <h3 class="chart-title">Đơn hàng gần đây</h3>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#DH001</td>
                <td>Nguyễn Văn A</td>
                <td>450.000 ₫</td>
                <td>Hoàn thành</td>
              </tr>
              <tr>
                <td>#DH002</td>
                <td>Trần Thị B</td>
                <td>320.000 ₫</td>
                <td>Đang giao</td>
              </tr>
              <tr>
                <td>#DH003</td>
                <td>Lê Văn C</td>
                <td>750.000 ₫</td>
                <td>Hoàn thành</td>
              </tr>
              <tr>
                <td>#DH004</td>
                <td>Phạm Thị D</td>
                <td>280.000 ₫</td>
                <td>Chờ xử lý</td>
              </tr>
              <tr>
                <td>#DH005</td>
                <td>Hoàng Văn E</td>
                <td>520.000 ₫</td>
                <td>Đang giao</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="performance-grid">
          <div class="performance-card">
            <div class="metric" style="color: #3b82f6;">87%</div>
            <div class="label">Tỷ lệ chuyển đổi</div>
          </div>
          <div class="performance-card">
            <div class="metric" style="color: #22c55e;">4.2/5</div>
            <div class="label">Đánh giá trung bình</div>
          </div>
          <div class="performance-card">
            <div class="metric" style="color: #8b5cf6;">24h</div>
            <div class="label">Thời gian xử lý TB</div>
          </div>
          <div class="performance-card">
            <div class="metric" style="color: #eab308;">92%</div>
            <div class="label">Tỷ lệ hài lòng</div>
          </div>
        </div>

        <div class="print-footer">
          <p>© 2024 DVFashion. Báo cáo được tạo tự động từ hệ thống quản lý.</p>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM | Điện thoại: (028) 1234 5678</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  }, 500);
};

// Hàm xuất báo cáo dưới dạng PDF
export const exportToPDF = async (reportData, selectedPeriod) => {
  try {
    // Import dynamic để tránh lỗi nếu chưa cài đặt
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const pdf = new jsPDF("p", "mm", "a4");

    // Tạo iframe để render nội dung độc lập
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.width = "794px";
    iframe.style.height = "1123px"; // A4 height in pixels
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Viết HTML hoàn toàn mới vào iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Báo cáo phân tích</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              color: inherit;
              background: transparent;
            }
            
            html, body {
              width: 794px;
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: #000000;
              background-color: #ffffff;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .container {
              width: 100%;
              padding: 20px;
              background-color: #ffffff;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #2563eb;
            }
            
            .header h1 {
              color: #1f2937;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .header p {
              color: #6b7280;
              font-size: 14px;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .stat-card {
              background-color: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            
            .stat-card.revenue {
              border-left: 4px solid #2563eb;
            }
            
            .stat-card.orders {
              border-left: 4px solid #059669;
            }
            
            .stat-card.products {
              border-left: 4px solid #d97706;
            }
            
            .stat-card.customers {
              border-left: 4px solid #7c3aed;
            }
            
            .stat-card h3 {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-weight: 600;
            }
            
            .stat-card .value {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 4px;
            }
            
            .stat-card .growth {
              font-size: 12px;
              color: #059669;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 15px;
              text-align: center;
            }
            
            .table-container {
              margin-bottom: 30px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5e7eb;
            }
            
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
            }
            
            td {
              color: #1f2937;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              display: inline-block;
            }
            
            .status-completed {
              background-color: #dcfce7;
              color: #166534;
            }
            
            .status-shipping {
              background-color: #dbeafe;
              color: #1e40af;
            }
            
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            
            .performance-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .performance-card {
              text-align: center;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .performance-card .metric {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .performance-card.conversion .metric {
              color: #2563eb;
            }
            
            .performance-card.rating .metric {
              color: #059669;
            }
            
            .performance-card.time .metric {
              color: #7c3aed;
            }
            
            .performance-card.satisfaction .metric {
              color: #d97706;
            }
            
            .performance-card .label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 2px;
            }
            
            .performance-card .change {
              font-size: 10px;
              margin-top: 2px;
            }
            
            .change.positive {
              color: #059669;
            }
            
            .change.negative {
              color: #dc2626;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            
            .footer p {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BÁO CÁO PHÂN TÍCH KINH DOANH</h1>
              <p>DVFashion - ${new Date().toLocaleDateString(
                "vi-VN"
              )} - Kỳ báo cáo: ${
      selectedPeriod === "7days"
        ? "7 ngày qua"
        : selectedPeriod === "30days"
        ? "30 ngày qua"
        : selectedPeriod === "3months"
        ? "3 tháng qua"
        : "Năm nay"
    }</p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card revenue">
                <h3>Tổng doanh thu</h3>
                <div class="value">${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(reportData.revenue)}</div>
                <div class="growth">+${reportData.revenueGrowth}%</div>
              </div>
              <div class="stat-card orders">
                <h3>Tổng đơn hàng</h3>
                <div class="value">${reportData.totalOrders.toLocaleString()}</div>
                <div class="growth">+${reportData.orderGrowth}%</div>
              </div>
              <div class="stat-card products">
                <h3>Sản phẩm</h3>
                <div class="value">${reportData.totalProducts}</div>
                <div class="growth">+${reportData.productGrowth}%</div>
              </div>
              <div class="stat-card customers">
                <h3>Khách hàng</h3>
                <div class="value">${reportData.totalCustomers.toLocaleString()}</div>
                <div class="growth">+${reportData.customerGrowth}%</div>
              </div>
            </div>

            <div class="table-container">
              <h3 class="section-title">Đơn hàng gần đây</h3>
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#DH001</td>
                    <td>Nguyễn Văn A</td>
                    <td>450.000 ₫</td>
                    <td><span class="status-badge status-completed">Hoàn thành</span></td>
                  </tr>
                  <tr>
                    <td>#DH002</td>
                    <td>Trần Thị B</td>
                    <td>320.000 ₫</td>
                    <td><span class="status-badge status-shipping">Đang giao</span></td>
                  </tr>
                  <tr>
                    <td>#DH003</td>
                    <td>Lê Văn C</td>
                    <td>750.000 ₫</td>
                    <td><span class="status-badge status-completed">Hoàn thành</span></td>
                  </tr>
                  <tr>
                    <td>#DH004</td>
                    <td>Phạm Thị D</td>
                    <td>280.000 ₫</td>
                    <td><span class="status-badge status-pending">Chờ xử lý</span></td>
                  </tr>
                  <tr>
                    <td>#DH005</td>
                    <td>Hoàng Văn E</td>
                    <td>520.000 ₫</td>
                    <td><span class="status-badge status-shipping">Đang giao</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 class="section-title">Chỉ số hiệu suất</h3>
              <div class="performance-grid">
                <div class="performance-card conversion">
                  <div class="metric">87%</div>
                  <div class="label">Tỷ lệ chuyển đổi</div>
                  <div class="change positive">+5% so với tháng trước</div>
                </div>
                <div class="performance-card rating">
                  <div class="metric">4.2/5</div>
                  <div class="label">Đánh giá trung bình</div>
                  <div class="change positive">+0.3 so với tháng trước</div>
                </div>
                <div class="performance-card time">
                  <div class="metric">24h</div>
                  <div class="label">Thời gian xử lý TB</div>
                  <div class="change negative">+2h so với tháng trước</div>
                </div>
                <div class="performance-card satisfaction">
                  <div class="metric">92%</div>
                  <div class="label">Tỷ lệ hài lòng</div>
                  <div class="change positive">+3% so với tháng trước</div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>© 2024 DVFashion. Báo cáo được tạo tự động từ hệ thống quản lý.</p>
              <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM | Điện thoại: (028) 1234 5678</p>
            </div>
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Đợi iframe load và render hoàn tất
    await new Promise((resolve) => {
      iframe.onload = () => {
        setTimeout(resolve, 500); // Đợi thêm 500ms để đảm bảo CSS được áp dụng
      };
      // Fallback nếu onload không fire
      setTimeout(resolve, 1000);
    });

    // Capture nội dung iframe
    const canvas = await html2canvas(iframe.contentDocument.body, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: iframe.contentDocument.body.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: iframe.contentDocument.body.scrollHeight,
      ignoreElements: (element) => {
        // Bỏ qua các element có thể chứa màu oklch
        return element.tagName === "SCRIPT" || element.tagName === "STYLE";
      },
    });

    // Xóa iframe
    document.body.removeChild(iframe);

    const imgData = canvas.toDataURL("image/png", 1.0);
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `BaoCaoPhantich_DVFashion_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Lỗi khi xuất PDF:", error);
    alert("Lỗi khi xuất PDF. Vui lòng thử lại hoặc kiểm tra kết nối mạng.");
  }
};

// Hàm xuất dữ liệu Excel
export const exportToExcel = async (reportData, selectedPeriod) => {
  try {
    // Import dynamic để tránh lỗi nếu chưa cài đặt
    const XLSX = await import("xlsx");

    // Tạo workbook mới
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const overviewData = [
      ["BÁO CÁO PHÂN TÍCH KINH DOANH - DVFASHION"],
      [
        `Kỳ báo cáo: ${
          selectedPeriod === "7days"
            ? "7 ngày qua"
            : selectedPeriod === "30days"
            ? "30 ngày qua"
            : selectedPeriod === "3months"
            ? "3 tháng qua"
            : "Năm nay"
        }`,
      ],
      [`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`],
      [],
      ["CHỈ SỐ TỔNG QUAN"],
      ["Chỉ số", "Giá trị", "Tăng trưởng (%)"],
      ["Tổng doanh thu", reportData.revenue, reportData.revenueGrowth],
      ["Tổng đơn hàng", reportData.totalOrders, reportData.orderGrowth],
      ["Tổng sản phẩm", reportData.totalProducts, reportData.productGrowth],
      ["Tổng khách hàng", reportData.totalCustomers, reportData.customerGrowth],
      [],
      ["CHỈ SỐ HIỆU SUẤT"],
      ["Chỉ số", "Giá trị"],
      ["Tỷ lệ chuyển đổi", "87%"],
      ["Đánh giá trung bình", "4.2/5"],
      ["Thời gian xử lý TB", "24h"],
      ["Tỷ lệ hài lòng", "92%"],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);

    // Định dạng cột
    ws1["!cols"] = [
      { wch: 20 }, // Cột A
      { wch: 15 }, // Cột B
      { wch: 15 }, // Cột C
    ];

    XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan");

    // Sheet 2: Đơn hàng gần đây
    const ordersData = [
      ["ĐƠN HÀNG GẦN ĐÂY"],
      [],
      ["Mã đơn", "Khách hàng", "Giá trị (VNĐ)", "Trạng thái"],
      ["#DH001", "Nguyễn Văn A", 450000, "Hoàn thành"],
      ["#DH002", "Trần Thị B", 320000, "Đang giao"],
      ["#DH003", "Lê Văn C", 750000, "Hoàn thành"],
      ["#DH004", "Phạm Thị D", 280000, "Chờ xử lý"],
      ["#DH005", "Hoàng Văn E", 520000, "Đang giao"],
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(ordersData);
    ws2["!cols"] = [
      { wch: 12 }, // Mã đơn
      { wch: 20 }, // Khách hàng
      { wch: 15 }, // Giá trị
      { wch: 15 }, // Trạng thái
    ];

    XLSX.utils.book_append_sheet(wb, ws2, "Đơn hàng");

    // Sheet 3: Dữ liệu biểu đồ
    const chartData = [
      ["DỮ LIỆU BIỂU ĐỒ"],
      [],
      ["DOANH THU THEO NGÀY"],
      ["Ngày", "Doanh thu (triệu VNĐ)"],
      ["Thứ 2", 12],
      ["Thứ 3", 19],
      ["Thứ 4", 15],
      ["Thứ 5", 25],
      ["Thứ 6", 22],
      ["Thứ 7", 30],
      ["Chủ nhật", 35],
      [],
      ["PHÂN BỔ THEO DANH MỤC"],
      ["Danh mục", "Doanh thu (%)"],
      ["Áo thun", 30],
      ["Áo polo", 25],
      ["Quần short", 20],
      ["Phụ kiện", 15],
      ["Đồ bơi", 10],
      [],
      ["TOP SẢN PHẨM BÁN CHẠY"],
      ["Sản phẩm", "Số lượng bán"],
      ["Áo thun basic", 150],
      ["Polo nam", 120],
      ["Short kaki", 100],
      ["Áo tank top", 85],
      ["Quần jean", 70],
    ];

    const ws3 = XLSX.utils.aoa_to_sheet(chartData);
    ws3["!cols"] = [
      { wch: 20 }, // Cột A
      { wch: 20 }, // Cột B
    ];

    XLSX.utils.book_append_sheet(wb, ws3, "Dữ liệu biểu đồ");

    // Xuất file Excel
    const fileName = `BaoCaoPhantich_DVFashion_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    alert("Cần cài đặt: npm install xlsx để sử dụng chức năng xuất Excel");
  }
};

// Hàm format dữ liệu cho export
export const formatReportData = (reportData) => {
  return {
    ...reportData,
    formattedRevenue: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(reportData.revenue),
    formattedOrders: reportData.totalOrders.toLocaleString(),
    formattedCustomers: reportData.totalCustomers.toLocaleString(),
    exportDate: new Date().toLocaleDateString("vi-VN"),
    exportTime: new Date().toLocaleTimeString("vi-VN"),
  };
};
