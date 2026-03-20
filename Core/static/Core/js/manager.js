let gestureCooldown = false
let selectedOption = null

function handleVoice(text) {

    text = text.toLowerCase();

    if (text.includes("siguiente")) {
        console.log("Comando: siguiente");
    }

    if (text.includes("anterior")) {
        console.log("Comando: anterior");
    }

    if (text.includes("seleccionar")) {
        console.log("Comando: seleccionar");
    }
}

function handleGesture(gesture){

    if (gestureCooldown && gesture !== "long_blink") return

    gestureCooldown = true

    const kind_view = getKindView(appState.currentView)
    if (kind_view === "menu"){
        if(gesture === "head_up"){
            menuMove(-1)}
        if(gesture === "head_down"){
            menuMove(1)}
        if(gesture === "long_blink"){
            confirmSelection()}

    } else if (kind_view === "story"){
        if(gesture === "head_left"){
            selectOption("left")}

        if(gesture === "head_right"){
            selectOption("right")}

        if(gesture === "head_up"){
            selectOption("up")}

        if(gesture === "head_down"){
            selectOption("down")}

        if(gesture === "long_blink"){
            confirmSelection()}
    }

    setTimeout(()=>{gestureCooldown = false}, 800)
}



function selectOption(direction){

    if(selectedOption === direction) return

    selectedOption = direction

    document.querySelectorAll(".gesture-option")
        .forEach(el=>el.classList.remove("active"))

    const el = document.getElementById("option-"+ direction)

    if(el){
        el.classList.add("active")}
}



function confirmSelection(){
    const kind_view = getKindView(appState.currentView)

    // Navegación tipo menú
    if(kind_view === "menu"){
        const activeView = document.querySelector(".view.active")
        const items = activeView.querySelectorAll(".menu-item")
        const selected = items[menuIndex]
        const action = selected.dataset.action

        console.log("Seleccionaste:", action)

        switch(appState.currentView){
            case "home":
                if(action === "menustory"){
                    goToView("menustory")
                }

                if(action === "login"){
                    goToView("login")
                }
            break
            
            case "menustory":
                if(action === "home"){
                    goToView("home")
                }
                if(action === "new_story"){
                    sendMessage("story","new")
                    goToView("story")
                }
                if(action === "record_story"){
                 
                }
            break

            case "login":
                if(action === "login"){
                 
                }
                if(action === "home"){
                    goToView("home")
                }
            break
        }

        return
    
    // Navegación tipo historias
    } else if (kind_view === "story"){

        if(!selectedOption) return

        const el = document.getElementById("option-" + selectedOption)
        const accion = el.dataset.action

        console.log("Seleccionaste:", accion)

        // animación visual
        el.classList.add("confirm")
        setTimeout(()=>{el.classList.remove("confirm")},800)

        if (accion === "left"){}
        if (accion === "right"){}
        if (accion === "pause"){}      
        if (accion === "return"){
            goToView("menustory")
        }
    }
}