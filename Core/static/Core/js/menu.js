// Lógica de navegación del menú
let menuIndex = 0
function menuMove(direction){

    const activeView = document.querySelector(".view.active")
    const items = activeView.querySelectorAll(".menu-item")

    let newIndex = menuIndex + direction

    // Validar limites
    if(newIndex < 0 || newIndex >= items.length){
        return
    }

    // ahora sí, cambio válido
    items[menuIndex].classList.remove("active")

    menuIndex = newIndex

    items[menuIndex].classList.add("active")
}

function resetMenu(){
    const activeView = document.querySelector(".view.active")
    const items = activeView.querySelectorAll(".menu-item")

    if(items.length === 0) return

    items.forEach(el => el.classList.remove("active"))

    menuIndex = 0
    items[0].classList.add("active")
}