async function loadRoutes() {
    try {
        const response = await fetch("http://localhost:9999/api/selectChuyenXe/routes");
        const routes = await response.json();

        const depatureSelect = document.getElementById("Depature");
        const destinationSelect = document.getElementById("Destination");
        const basePriceInput = document.getElementById("BasePrice");

        // Populate departure dropdown
        const depatureOptions = [...new Set(routes.map(route => route.Depature))];
        depatureOptions.forEach(depature => {
            let option = document.createElement("option");
            option.textContent = depature;
            option.value = depature;
            depatureSelect.appendChild(option);
        });

        // Populate destination dropdown
        const destinationOptions = [...new Set(routes.map(route => route.Destination))];
        destinationOptions.forEach(destination => {
            let option = document.createElement("option");
            option.textContent = destination;
            option.value = destination;
            destinationSelect.appendChild(option);
        });

        // Update base price when either dropdown changes
        function updateBasePrice() {
            const selectedDepature = depatureSelect.value;
            const selectedDestination = destinationSelect.value;

            if (selectedDepature && selectedDestination) {
                const route = routes.find(route => 
                    route.Depature === selectedDepature && route.Destination === selectedDestination
                );
                basePriceInput.value = route ? route.BasePrice : "Không tuyến đó!!!";
            } else {
                basePriceInput.value = "";
            }
        }

        // Add event listeners for dropdown changes
        depatureSelect.addEventListener("change", updateBasePrice);
        destinationSelect.addEventListener("change", updateBasePrice);
    } catch (error) {
        console.error("Lỗi tải danh sách tuyến đường", error);
    }
}

async function loadEmployees() {
    try {
        const response = await fetch("http://localhost:9999/api/selectChuyenXe/employees");
        const employees = await response.json();
        
        const select = document.getElementById("employee");
        
        employees.forEach(employee => {
            let option = document.createElement("option");
            option.textContent = employee.Ten_NV;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi tải danh sách", error);
    }
}

async function loadBuses() {
        try {
            const response = await fetch("http://localhost:9999/api/selectChuyenXe/buses");
            const LicensePlates = await response.json();
            
            const select = document.getElementById("LicensePlate");
            
            LicensePlates.forEach(LicensePlate => {
                let option = document.createElement("option");
                option.textContent = LicensePlate.LicensePlate;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Lỗi tải danh sách", error);
        }
    }

window.onload = () => {
    loadRoutes();
    loadEmployees();
    loadBuses();
};