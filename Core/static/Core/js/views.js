let appState = {
    currentView: "home"}

let views = {
    kind_menu: ["home", "menustory","ManageGestures"],
    kind_story: ["story"],
}

function getKindView(currentView){
    if(views.kind_menu.includes(currentView)) return "menu"
    if(views.kind_story.includes(currentView)) return "story"
    return null
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

    resetMenu()
}