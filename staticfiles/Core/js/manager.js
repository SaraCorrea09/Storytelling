let gestureCooldown = false
let selectedOption = null

function selectOption(direction){

    if(selectedOption === direction) return

    selectedOption = direction

    document.querySelectorAll(".gesture-option")
        .forEach(el=>el.classList.remove("active"))

    const el = document.getElementById("option-"+ direction)

    if(el){
        el.classList.add("active")
}
}


function confirmSelection(){

    if(!selectedOption) return

    if(appState.currentView === "home"){

        const items = document.querySelectorAll(".menu-item")
        const selected = items[menuIndex]

        const action = selected.dataset.action

        console.log("Seleccionaste:", action)

        // 🔥 AQUÍ decides qué hacer
        if(action === "story"){
            goToView("story")
        }

        if(action === "login"){
            goToView("login")
        }

        return
    }

    const el = document.getElementById("option-"+ selectedOption)

    // animación visual
    el.classList.add("confirm")

    setTimeout(()=>{
        el.classList.remove("confirm")
    },400)

    // enviar al backend
    socket.send(JSON.stringify({
        type:"confirm",
        value:selectedOption
    }))
}

function handleGesture(gesture){

    if (gestureCooldown && gesture !== "long_blink") return

    gestureCooldown = true

        // SOLO si estás en home
    if(appState.currentView === "home"){

        if(gesture === "head_up"){
            menuMove(-1)
        }

        if(gesture === "head_down"){
            menuMove(1)
        }
    }

    if(gesture === "head_left"){
        selectOption("left")
    }

    if(gesture === "head_right"){
        selectOption("right")
    }

    if(gesture === "head_up"){
        selectOption("up")
    }

    if(gesture === "head_down"){
        selectOption("down")
    }

    if(gesture === "long_blink"){
        confirmSelection()
    }

    setTimeout(()=>{
        gestureCooldown = false
    }, 600)
}