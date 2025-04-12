const tripContainer = document.getElementById("tripContainer");

// Hàm định dạng giờ (HH:mm)
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Hàm định dạng giá tiền
function formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + " VND";
}

// Hiển thị thông tin chi tiết chuyến đi
function displayTripInfo(trip) {
    const tripDetailDiv = document.getElementById("tripDetail");

    tripDetailDiv.innerHTML = `
        <p><strong>Điểm khởi hành:</strong> ${trip.Depature}</p>
        <p><strong>Điểm đến:</strong> ${trip.Destination}</p>
        <p><strong>Thời gian khởi hành:</strong> ${trip.DepartureTime}</p>
        <p><strong>Thời gian đến:</strong> ${trip.ArrivalTime}</p>
        <p><strong>Ghế còn:</strong> ${trip.SeatCapacity}</p>
        <p><strong>Giá:</strong> ${formatPrice(trip.BasePrice)}</p>
    `;
}

// Gọi API lấy chi tiết chuyến đi
function bookTicket(tripId) {
    const apiUrl = `http://localhost:9999/api/ctdatve/ctdatve/${tripId}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Trip not found or server error');
            }
            return response.json();
        })
        .then(data => {
            displayTripInfo(data);
        })
        .catch(error => {
            console.error('Error fetching trip:', error);
            document.getElementById("tripDetail").innerHTML =
                `<p style="color:red;">Không tìm thấy thông tin chuyến đi.</p>`;
        });
}
