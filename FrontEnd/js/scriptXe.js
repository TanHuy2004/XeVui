document.addEventListener("DOMContentLoaded", function () {
    const busForm = document.getElementById("XeFormElement");
    const tableBody = document.getElementById("busTableBody");

    
    async function loadBuses() {
        const tableBody = document.querySelector("#busTableBody");
        tableBody.innerHTML = "";
        try {
            // Gọi đồng thời cả hai API
            const [busRes, companyRes] = await Promise.all([
                fetch("http://localhost:9999/api/xe/bus"),
                fetch("http://localhost:9999/api/selectTenXeCTY/selectTenXeCTY")
            ]);

            if (!busRes.ok || !companyRes.ok) throw new Error("Không thể tải dữ liệu");

            const buses = await busRes.json();
            const companies = await companyRes.json();

            buses.sort((a, b) => a.BusID - b.BusID);

            if (buses.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5">Chưa có dữ liệu xe nào!!!</td></tr>`;
                return;
            }

            // Duyệt danh sách xe và hiển thị
            for (const bus of buses) {
                const company = companies.find(c => c.BusCompanyID === bus.BusCompanyID);
                const companyName = company ? company.Name : "Không xác định";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${bus.BusID}</td>
                    <td>${bus.LicensePlate}</td>
                    <td>${bus.SeatCapacity}</td>
                    <td>${companyName}</td>
                    <td>
                        <button class="edit-btn" onclick="editBus('${bus.BusID}', '${bus.LicensePlate}', '${bus.SeatCapacity}', '${bus.BusCompanyID}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteBus('${bus.BusID}')">Xóa</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu xe:", error);
            tableBody.innerHTML = `<tr><td colspan="5">Lỗi tải dữ liệu xe: ${error.message}</td></tr>`;
        }
    }

    busForm.addEventListener("submit", async function (event) {
        event.preventDefault();
    
        const formData = new FormData(busForm);
        const bus = {
            busID: (formData.get("busID") || "").trim(), // Fallback to empty string if null
            licensePlate: (formData.get("licensePlate") || "").trim(),
            seatCapacity: parseInt(formData.get("capacity") || "0", 10), // Fallback to "0" if null
            companyName: (formData.get("company") || "").trim() // Fallback to empty string if null
        };
    
        // Clear previous messages
        document.getElementById("errorBusID").textContent = "";
        document.getElementById("errorLicensePlate").textContent = "";
        document.getElementById("errorSeatCapacity").textContent = "";
        document.getElementById("errorBusCompanyID").textContent = "";
        document.getElementById("busSuccessMessage").textContent = "";
        document.getElementById("busErrorMessage").textContent = "";
    
        let hasError = false;
    
        // Validation
        if (!bus.busID) {
            document.getElementById("errorBusID").textContent = "Hãy nhập mã xe!";
            hasError = true;
        }
        if (!bus.licensePlate) {
            document.getElementById("errorLicensePlate").textContent = "Hãy nhập biển số xe!";
            hasError = true;
        }
        if (!bus.seatCapacity || isNaN(bus.seatCapacity) || bus.seatCapacity < 1) {
            document.getElementById("errorSeatCapacity").textContent = "Sức chứa phải là số lớn hơn 0!";
            hasError = true;
        }
        if (!bus.companyName) {
            document.getElementById("errorBusCompanyID").textContent = "Hãy chọn nhà xe!";
            hasError = true;
        }
    
        if (hasError) return;
    
        const submitType = event.submitter.name;
        let url = "http://localhost:9999/api/xe/bus";
        let method = "POST";
    
        if (submitType === "sua") {
            method = "PUT";
            url = `http://localhost:9999/api/xe/bus/${bus.busID}`; // Include busID in the URL for PUT
        }
    
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bus)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                document.getElementById("busSuccessMessage").textContent = result.message || "Thao tác thành công!";
                busForm.reset();
                document.getElementById("busID").disabled = false; // Re-enable busID input
                loadBuses();
            } else {
                document.getElementById("busErrorMessage").textContent = result.message || "Có lỗi xảy ra, vui lòng thử lại.";
            }
        } catch (error) {
            console.error("❌ Lỗi gửi dữ liệu:", error);
            document.getElementById("busErrorMessage").textContent = "Có lỗi xảy ra khi gửi dữ liệu!";
        }
    });
    
    window.deleteBus = async function (busID) {
        if (!confirm("Bạn có chắc chắn muốn xóa xe này không?")) return;

        try {
            const response = await fetch(`http://localhost:9999/api/xe/bus/${busID}`, {
                method: "DELETE"
            });

            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadBuses();
            }
        } catch (error) {
            console.error("❌ Lỗi xóa xe:", error);
            alert("Lỗi xóa xe: " + error.message);
        }
    };

    window.editBus = async function (id, licensePlate, seatCapacity, busCompanyID) {
        try {
            // Fetch the company name for the given BusCompanyID
            const response = await fetch("http://localhost:9999/api/selectTenXeCTY/selectTenXeCTY");
            if (!response.ok) throw new Error("Không thể tải danh sách công ty");
            const companies = await response.json();
            const company = companies.find(c => c.BusCompanyID === busCompanyID);
            const companyName = company ? company.Name : "";

            // Populate the form
            document.getElementById("busID").value = id;
         
            document.getElementById("licensePlate").value = licensePlate;
            document.getElementById("capacity").value = seatCapacity;
            document.getElementById("company").value = companyName; // Set the company Name
        } catch (error) {
            console.error("❌ Lỗi khi chỉnh sửa xe:", error);
            document.getElementById("busErrorMessage").textContent = "Lỗi khi tải thông tin công ty.";
        }
    };

    loadBuses();
});