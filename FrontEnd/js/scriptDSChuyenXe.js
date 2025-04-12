document.addEventListener("DOMContentLoaded", function () {
    const tripContainer = document.getElementById("tripContainer");
    const searchForm = document.querySelector(".search-form");

    // Hàm format thời gian
    function formatTime(dateTime) {
        try {
            const date = new Date(dateTime);
            if (isNaN(date)) throw new Error("Invalid date");
            return date.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            console.error("Lỗi format thời gian:", error);
            return "Không xác định";
        }
    }
    

    // Hàm format giá
    function formatPrice(price) {
        try {
            return new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(price);
        } catch (error) {
            console.error("Lỗi format giá:", error);
            return "Không xác định";
        }
    }


    async function fetchAndDisplayTrips(departure = "", destination = "", travelDate = "") {
        tripContainer.innerHTML = "<p>Đang tải danh sách chuyến xe...</p>";

        try {
            // Tạo URL với query params nếu có
            const url = new URL("http://localhost:9999/api/dstrip/dstrip");

            if (departure) url.searchParams.append("departure", departure);
            if (destination) url.searchParams.append("destination", destination);
            if (travelDate) url.searchParams.append("travelDate", travelDate);


            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (!result.success) {
                tripContainer.innerHTML = "<p>Đã xảy ra lỗi khi tải danh sách chuyến xe.</p>";
                return;
            }

            if (result.data.length === 0) {
                tripContainer.innerHTML = "<p>Không tìm thấy chuyến xe nào.</p>";
                return;
            }

            tripContainer.innerHTML = "";

            result.data.forEach((trip) => {
                const tripElement = document.createElement("div");
                tripElement.className = "trip-item";
                    tripElement.innerHTML = `
                        <div class="trip-details">
                            <div class="time-info">
                            <span class="departure-time"></i> ${formatTime(trip.DepartureTime)}</span>
                            <span class="dot-separator">•</span>
                            <span class="arrival-time">${formatTime(trip.ArrivalTime)}</span>
                        </div>

                        <div class="route-info">
                            <span>
                                <i class="fas fa-map-marker-alt"></i> 
                                ${trip.Depature || "Không xác định"} 
                                <i class="fas fa-arrow-right mx-2"></i> 
                                ${trip.Destination || "Không xác định"}
                            </span>
                        </div>
                            <div class="bus-info">
                                <span><i class="fas fa-chair"></i>${trip.SeatCapacity || 0} chỗ trống</span>
                            </div>
                            <div class="price-info">
                                <span><i class="fas fa-money-bill-wave"></i> ${formatPrice(trip.BasePrice)}</span>
                            </div>
                            <div>
                                <button class="select-trip-button" onclick="bookTicket(${trip.TripID})">Đặt vé</button>
                            </div>
                        </div>
                    `;

                tripContainer.appendChild(tripElement);
            });
        } catch (error) {
            console.error("Lỗi khi tải danh sách chuyến xe:", error);
            tripContainer.innerHTML = "<p>Đã xảy ra lỗi khi tải danh sách chuyến xe.</p>";
        }
    }
        // Xử lý khi người dùng nhấn nút tìm kiếm
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
    
            const departure = document.getElementById("Depature").value;
            const destination = document.getElementById("Destination").value;
            const travelDate = document.querySelector("input[name='travel-date']").value;
    
            fetchAndDisplayTrips(departure, destination, travelDate);
        });
        

    // Gọi hàm để tải tất cả chuyến xe khi trang tải
    const dep = getQueryParam("depature"); // lỗi chính tả từ "departure"
    const des = getQueryParam("destination");
    const date = getQueryParam("date");
    fetchAndDisplayTrips(dep, des, date);
    
});

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || "";
}


