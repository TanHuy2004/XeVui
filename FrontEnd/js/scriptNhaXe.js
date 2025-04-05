document.addEventListener("DOMContentLoaded", function () {
    const busCompanyForm = document.getElementById("busCompanyFormElement");
    const tableBody = document.getElementById("busCompanyTableBody");

    async function loadBusCompanies() {
        tableBody.innerHTML = "";
        try {
            const response = await fetch("http://localhost:9999/api/nhaxe/bus-company");
            if (!response.ok) throw new Error("Không thể tải dữ liệu");
            const busCompanies = await response.json();

            if (busCompanies.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5">Chưa có dữ liệu nhà xe nào!!!</td></tr>`;
            } else {
                busCompanies.forEach(bus => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${bus.BusCompanyID}</td>
                        <td>${bus.Name}</td>
                        <td>${bus.Phone}</td>
                        <td>${bus.Address}</td>
                        <td>
                            <button class="edit-btn" onclick="editBusCompany('${bus.BusCompanyID}', '${bus.Name}', '${bus.Phone}', '${bus.Address}')">Sửa</button>
                            <button class="delete-btn" onclick="deleteBusCompany('${bus.BusCompanyID}')">Xóa</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu nhà xe:", error);
            tableBody.innerHTML = `<tr><td colspan="5">Chưa có dữ liệu nhà xe nào!!!</td></tr>`;
        }
    }

   

    busCompanyForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(busCompanyForm);
        const busCompany = {
            busCompanyID: formData.get("busCompanyID").trim(),
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            address: formData.get("address").trim()
        };

        // Xóa thông báo lỗi trước đó
        document.getElementById("errorID").textContent = "";
        document.getElementById("errorName").textContent = "";
        document.getElementById("errorPhone").textContent = "";
        document.getElementById("errorAddress").textContent = "";
        document.getElementById("busCompanySuccessMessage").textContent = "";
        document.getElementById("busCompanyErrorMessage").textContent = "";

        let hasError = false;

        // Kiểm tra nếu có trường nào trống
        if (!busCompany.busCompanyID) {
            document.getElementById("errorID").textContent = "Hãy nhập mã nhà xe!";
            hasError = true;
        } else if (busCompany.busCompanyID.length !== 5) {
            document.getElementById("errorID").textContent = "Mã nhà xe phải có 5 ký tự!";
            hasError = true;
        } 

        if (!busCompany.name) {
            document.getElementById("errorName").textContent = "Hãy nhập tên nhà xe!";
            hasError = true;
        }

        if (!busCompany.phone) {
            document.getElementById("errorPhone").textContent = "Hãy nhập số điện thoại!";
            hasError = true;
        } else if (!/^\d{10,11}$/.test(busCompany.phone)) {
            document.getElementById("errorPhone").textContent = "Số điện thoại phải có 10 hoặc 11 chữ số!";
            hasError = true;
        }

        if (!busCompany.address) {
            document.getElementById("errorAddress").textContent = "Hãy nhập địa chỉ!";
            hasError = true;
        }

        // Nếu có lỗi, focus vào form và dừng xử lý
        if (hasError) return;

        const submitType = event.submitter.name;
        let url = "http://localhost:9999/api/nhaxe/bus-company";
        let method = "POST";

        if (submitType === "sua") {
            method = "PUT";
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(busCompany)
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById("busCompanySuccessMessage").textContent = result.message || "Thao tác thành công!";
                busCompanyForm.reset();
                loadBusCompanies();
            } else {
                document.getElementById("busCompanyErrorMessage").textContent = result.message || "Có lỗi xảy ra, vui lòng thử lại.";
            }
        } catch (error) {
            console.error("❌ Lỗi gửi dữ liệu:", error);
            document.getElementById("busCompanyErrorMessage").textContent = "Có lỗi xảy ra khi gửi dữ liệu!";
        }
    });

    window.deleteBusCompany = async function (busCompanyID) {
        if (!confirm("Bạn có chắc chắn muốn xóa nhà xe này không?")) return;

        try {
            const response = await fetch(`http://localhost:9999/api/nhaxe/bus-company/${busCompanyID}`, {
                method: "DELETE"
            });

            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadBusCompanies();
            }
        } catch (error) {
            console.error("❌ Lỗi xóa nhà xe:", error);
        }
    };

    window.editBusCompany = function (id, name, phone, address) {
        document.getElementById("NXbusCompanyID").value = id;
        document.getElementById("NXbusCompanyName").value = name;
        document.getElementById("NXbusCompanyPhone").value = phone;
        document.getElementById("NXbusCompanyAddress").value = address;
    };

    loadBusCompanies();
});
