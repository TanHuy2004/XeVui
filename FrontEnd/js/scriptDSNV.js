document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("employeeTableBody");

    try {
        const response = await fetch("http://localhost:9999/api/nhanvien/employee");
        if (!response.ok) throw new Error("Không thể tải dữ liệu");
        const employees = await response.json();

        if (employees.length === 0) {
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="4">Không có dữ liệu nhân viên</td>`;
            tableBody.appendChild(noDataRow);
        } else {
            employees.forEach(emp => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${emp.employeeID}</td>
                    <td>${emp.employeeName}</td>
                    <td>${emp.employeeRole}</td>
                    <td>${emp.employeePhone}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("❌ Lỗi tải dữ liệu nhân viên:", error);
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `<td colspan="4">Lỗi khi tải dữ liệu nhân viên. Vui lòng thử lại sau.</td>`;
        tableBody.appendChild(errorRow);
    }
});
