document.addEventListener("DOMContentLoaded", function () {
    const tripForm = document.getElementById("tripFormElement");
    const tableBody = document.getElementById("tripTableBody");

    async function loadTrips() {
        const tableBody = document.querySelector("#tripTableBody");
        tableBody.innerHTML = "";
        try {
            const tripRes = await fetch("http://localhost:9999/api/chuyenxe/trip");
            if (!tripRes.ok) throw new Error("Không thể tải dữ liệu");
    
            const trips = await tripRes.json();
    
            if (!trips.success || trips.data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="9">Chưa có dữ liệu chuyến đi nào!!!</td></tr>`;
                return;
            }
            
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return isNaN(date) ? "Không xác định" : date.toLocaleString();
            };
    
            // Hàm định dạng giá tiền
            const formatPrice = (price) => {
                if (price !== undefined && price !== null) {
                    let numberValue = Number(price);
                    return numberValue.toLocaleString('vi-VN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    });
                }
                return "Không xác định";
            };
    
            for (const trip of trips.data) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${trip.TripID}</td>
                    <td>${trip.Depature || "Không xác định"}</td>
                    <td>${trip.Destination || "Không xác định"}</td>
                    <td>${formatDate(trip.DepartureTime)}</td>
                    <td>${formatDate(trip.ArrivalTime)}</td>
                    <td>${trip.Ten_NV || "Không xác định"}</td>
                    <td>${trip.LicensePlate || "Không xác định"}</td>
                    <td>${formatPrice(trip.BasePrice)}</td> <!-- Định dạng BasePrice ở đây -->
                    <td>
                        <button class="edit-btn" onclick="editTrip('${trip.TripID}', '${trip.Depature || ''}', '${trip.Destination || ''}', '${trip.DepartureTime}', '${trip.ArrivalTime}', '${trip.Ten_NV || ''}', '${trip.LicensePlate || ''}', '${trip.BasePrice || ''}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteTrip('${trip.TripID}')">Xóa</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu chuyến đi:", error);
            tableBody.innerHTML = `<tr><td colspan="9">Chưa có dữ liệu chuyến đi nào!!! ${error.message}</td></tr>`;
        }
    }
    

    tripForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(tripForm);
        let isValid = true;

    // Kiểm tra từng trường
    if (!formData.get("tripID")) {
        document.getElementById("errorTripID").textContent = "Vui lòng nhập mã chuyến đi.";
        isValid = false;
    }

    if (!formData.get("Depature")) {
        document.getElementById("errorDepature").textContent = "Vui lòng chọn điểm khởi hành.";
        isValid = false;
    }

    if (!formData.get("Destination")) {
        document.getElementById("errorDestination").textContent = "Vui lòng chọn điểm đến.";
        isValid = false;
    }

    if (!formData.get("departureTime")) {
        document.getElementById("errorDepartureTime").textContent = "Vui lòng chọn thời gian khởi hành.";
        isValid = false;
    }

    if (!formData.get("arrivalTime")) {
        document.getElementById("errorArrivalTime").textContent = "Vui lòng chọn thời gian đến.";
        isValid = false;
    }

    if (!formData.get("employee")) {
        document.getElementById("erroremployee").textContent = "Vui lòng chọn nhân viên.";
        isValid = false;
    }

    if (!formData.get("LicensePlate")) {
        document.getElementById("errorLicensePlate").textContent = "Vui lòng chọn xe phụ trách.";
        isValid = false;
    }

    if (!isValid) return; 

    
        const trip = {
            tripID: formData.get("tripID"),
            Depature: formData.get("Depature"),
            Destination: formData.get("Destination"),
            departureTime: formData.get("departureTime"),
            arrivalTime: formData.get("arrivalTime"),
            employee: formData.get("employee"),
            LicensePlate: formData.get("LicensePlate"),
            BasePrice: parseFloat(formData.get("BasePrice"))
        };

        let url = "http://localhost:9999/api/chuyenxe/trip";
        let method = "POST";

        if (event.submitter.name === "sua") {
            method = "PUT";
            url = `${url}/${trip.tripID}`;
        }
       
    
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trip)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || "Thao tác thành công!");
                tripForm.reset();
                loadTrips();
            } else {
                alert(result.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("❌ Lỗi gửi dữ liệu:", error);
            alert("Có lỗi xảy ra khi gửi dữ liệu!");
        }
    });

    window.deleteTrip = async function (tripID) {
        if (!confirm("Bạn có chắc chắn muốn xóa chuyến xe này không?")) return;

        try {
            const response = await fetch(`http://localhost:9999/api/chuyenxe/trip/${tripID}`, {
                method: "DELETE"
            });

            const result = await response.json();
            alert(result.message);
            if (response.ok) {
                loadTrips();
            }
        } catch (error) {
            console.error("❌ Lỗi xóa chuyến xe:", error);
            alert("Lỗi xóa chuyến xe: " + error.message);
        }
    };

    window.editTrip = function (tripID, Departure, Destination, DepartureTime, ArrivalTime, Employee, LicensePlate, BasePrice) {
        // Điền thông tin vào form để chỉnh sửa
        document.getElementById("tripID").value = tripID || '';
        document.getElementById("Depature").value = Departure || ''; 
        document.getElementById("Destination").value = Destination || '';
        
        // Định dạng lại thời gian để phù hợp với input datetime-local (nếu cần)
        const formatInputDate = (dateStr) => {
            const date = new Date(dateStr);
            return isNaN(date) ? '' : date.toISOString().slice(0, 16); // Định dạng YYYY-MM-DDTHH:MM
        };
        
        document.getElementById("departureTime").value = formatInputDate(DepartureTime);
        document.getElementById("arrivalTime").value = formatInputDate(ArrivalTime);
        document.getElementById("employee").value = Employee || '';
        document.getElementById("LicensePlate").value = LicensePlate || '';
        document.getElementById("BasePrice").value = BasePrice || '';
    };

    const fieldsToValidate = [
        { id: "tripID", errorId: "errorTripID" },
        { id: "Depature", errorId: "errorDepature" },
        { id: "Destination", errorId: "errorDestination" },
        { id: "departureTime", errorId: "errorDepartureTime" },
        { id: "arrivalTime", errorId: "errorArrivalTime" },
        { id: "employee", errorId: "erroremployee" },
        { id: "LicensePlate", errorId: "errorLicensePlate" },
    ];
    
    fieldsToValidate.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener("input", () => {
                document.getElementById(field.errorId).textContent = "";
            });
            input.addEventListener("change", () => {
                document.getElementById(field.errorId).textContent = "";
            });
        }
    });
    loadTrips();
});