async function loadBusCompanies() {
    try {
        const response = await fetch("http://localhost:9999/api/selectTenXeCTY/selectTenXeCTY");
        const companies = await response.json();
        
        const select = document.getElementById("company");
        companies.forEach(company => {
            let option = document.createElement("option");
            option.textContent = company.Name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi tải danh sách công ty xe:", error);
    }
}

// Gọi hàm khi trang tải xong
window.onload = loadBusCompanies;