// Lógica de navegación del menú
let menuIndex = 0
function menuMove(direction){

    const items = document.querySelectorAll(".menu-item")

    // quitar selección actual
    items[menuIndex].classList.remove("active")

    // mover índice
    menuIndex += direction

    // límites
    if(menuIndex < 0) menuIndex = 0
    if(menuIndex >= items.length) menuIndex = items.length - 1

    // activar nuevo
    items[menuIndex].classList.add("active")
}