let appState = {
    currentView: "home"
}

// Gestion de vistas
function goToView(viewName){

    if(appState.currentView === viewName) return

    console.log("Cambiando a vista:", viewName)

    // ocultar todas las vistas
    document.querySelectorAll(".view")
        .forEach(v => v.classList.remove("active"))

    // mostrar la nueva
    const nextView = document.getElementById("view-" + viewName)

    if(nextView){
        nextView.classList.add("active")
        appState.currentView = viewName
    }
}