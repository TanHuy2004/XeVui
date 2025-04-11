document.addEventListener('DOMContentLoaded', () => {
    const routeForm = document.getElementById('routeFormElement');
    const routeTableBody = document.getElementById('routeTableBody');

    // Fetch and display all routes
    async function loadRoutes() {
        try {
            const response = await fetch('http://localhost:9999/api/tuyenduong/route');
            const routes = await response.json();

            routes.sort((a, b) => a.routeID - b.routeID);
            
            routeTableBody.innerHTML = '';
            routes.forEach(route => {
                let formattedPrice = '';
    
                if (route.basePrice !== undefined && route.basePrice !== null) {
                    let numberValue = Number(route.basePrice);
                    // Luôn hiển thị 2 chữ số thập phân, thay dấu chấm thành dấu phẩy
                    formattedPrice = numberValue.toLocaleString('vi-VN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                    })
                }
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${route.routeID}</td>
                    <td>${route.departure}</td>
                    <td>${route.destination}</td>
                    <td>${route.distance}</td>
                    <td>${formattedPrice}</td>
                    <td>
                        <button class="edit-btn" onclick="editRoute('${route.routeID}', '${route.departure}', '${route.destination}', '${route.distance}', '${route.basePrice}')">Sửa</button>
                        <button class="delete-btn" onclick="deleteRoute('${route.routeID}')">Xóa</button>
                    </td>
                `;
                routeTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    }
    
    // Add or update a route
    routeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData(routeForm);
        const route = {
            routeID: formData.get("routeID").trim(),
            departure: formData.get("departure").trim(),
            destination: formData.get("destination").trim(),
            distance: formData.get("distance").trim().replace(',', '.'), // Thay dấu phẩy thành dấu chấm
            basePrice: formData.get("basePrice").trim().replace(',', '.') // Thay dấu phẩy thành dấu chấm
        };
    
        document.getElementById("errorID").textContent = "";
        document.getElementById("errorDeparture").textContent = "";
        document.getElementById("errorDestination").textContent = "";
        document.getElementById("errorDistance").textContent = "";
        document.getElementById("errorBasePrice").textContent = "";
        document.getElementById("routeSuccessMessage").textContent = "";
        document.getElementById("routeErrorMessage").textContent = "";
    
        let hasError = false;

    
        if (!route.routeID) {
            document.getElementById("errorID").textContent = "Hãy nhập mã tuyến đường!";
            hasError = true;
        }
        if (!route.departure) {
            document.getElementById("errorDeparture").textContent = "Hãy nhập điểm khởi hành!";
            hasError = true;
        }
        if (!route.destination) {
            document.getElementById("errorDestination").textContent = "Hãy nhập điểm đến!";
            hasError = true;
        }
        if (!route.distance) {
            document.getElementById("errorDistance").textContent = "Hãy nhập khoảng cách!";
            hasError = true;
        }
        if (!route.basePrice) {
            document.getElementById("errorBasePrice").textContent = "Hãy nhập giá tuyến!";
            hasError = true;
        } 
        if (hasError) return;
    
        const submitType = event.submitter.name;
        let url = "http://localhost:9999/api/tuyenduong/route";
        let method = "POST";
    
        if (submitType === "sua") {
            method = "PUT";
        }
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(route)
            });
            const result = await response.json();
            if (response.ok) {
                document.getElementById('routeSuccessMessage').textContent = result.message;
                loadRoutes();
                routeForm.reset();
            } else {
                document.getElementById('routeErrorMessage').textContent = result.message;
            }
        } catch (error) {
            console.error('Error saving route:', error);
            document.getElementById('routeErrorMessage').textContent = 'Đã xảy ra lỗi khi lưu tuyến đường!';
        }
    });

    // Edit a route
    window.editRoute = async (routeID, departure, destination, distance, basePrice) => {
        document.getElementById("TDrouteID").value = routeID;
        document.getElementById("TDdeparture").value = departure;
        document.getElementById("TDdestination").value = destination;
        document.getElementById("TDdistance").value = distance;
    
        // Format lại basePrice khi đưa lên input
        let numberValue = parseFloat(basePrice);
        if (!isNaN(numberValue)) {
            let parts = numberValue.toString().split('.');
            let formattedInteger = Number(parts[0]).toLocaleString('vi-VN');
            let formatted = parts[1] ? `${formattedInteger},${parts[1]}` : formattedInteger;
            document.getElementById("TDbasePrice").value = formatted;
        } else {
            document.getElementById("TDbasePrice").value = '';
        }
    };
    

    // Delete a route
    window.deleteRoute = async (routeID) => {
        if (!confirm("Bạn có chắc chắn muốn xóa tuyến đường này không?")) return;

        try {
            const response = await fetch(`http://localhost:9999/api/tuyenduong/route/${routeID}`, {
                method: "DELETE"
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                loadRoutes();
            } else {
                alert(result.error || "Xóa tuyến đường thất bại!");
            }
        } catch (error) {
            console.error("❌ Lỗi xóa tuyến đường:", error);
        }
    };
    const routeFields = [
        { id: "TDrouteID", errorId: "errorID" },
        { id: "TDdeparture", errorId: "errorDeparture" },
        { id: "TDdestination", errorId: "errorDestination" },
        { id: "TDdistance", errorId: "errorDistance" },
        { id: "TDbasePrice", errorId: "errorBasePrice" }
    ];
    
    routeFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener("input", () => {
                document.getElementById(field.errorId).textContent = "";
                document.getElementById("routeErrorMessage").textContent = "";
                document.getElementById("routeSuccessMessage").textContent = "";
            });
        }
    });
    
    // Initial fetch of routes
    loadRoutes();
});

