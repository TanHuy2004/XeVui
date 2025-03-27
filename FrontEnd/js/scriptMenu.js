const hamMenu = document.querySelector(".ham-menu");
const menuList = document.querySelector(".menu-list");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    menuList.classList.toggle("active");
});
