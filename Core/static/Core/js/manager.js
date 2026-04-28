let gestureCooldown = false
let selectedOption = null

function managerAnswer(data){
    if(data.type === "story" && data.action === "view"){
        goToView("story")
        loadStory(data.payload)
    }
    if(data.type === "story" && data.action === "list"){}
}

function handleVoice(text) {

    text = text.toLowerCase();

    const stateOptions = {
        "home": {"menustory": "Historias", "ManageGestures": "Sensibilidad de Gestos"},
        "menustory": {"new_story": "Historia Aleatoria", "record_story": "Lista de Historias", "home": "Volver"},
        "ManageGestures": {"home": "Volver"},
        "story": {"left": "Opción Izquierda", "right": "Opción Derecha", "pause": "Pausar", "reset": "Reiniciar", "return": "Volver", "resume": "reanudar"}
    }

    const currentView = appState.currentView
    const options = stateOptions[currentView]

    if (!options) return;

    for (const action in options) {
        const phrase = options[action].toLowerCase();

        if (text.includes(phrase)) {
            console.log("Acción detectada:", action);
            let selectedOption = null;

            if (currentView === "story") {
                if (action === "reset" || action === "return") {
                selectedOption = "down" }

                else if (action === "pause" || action === "resume") {
                selectedOption = "up" }

                else {
                selectedOption = action}

                confirmSelection(action,selectedOption);

            } else {
                confirmSelection(action);}

            return;
        }
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



function confirmSelection(action = null, optionFromVoice = null){
    const kind_view = getKindView(appState.currentView)
    const StartAudio = "Seleccionaste "

    // Navegación tipo menú
    if(kind_view === "menu"){

        if (!action){
            const activeView = document.querySelector(".view.active")
            const items = activeView.querySelectorAll(".menu-item")
            const selected = items[menuIndex]
            action = selected.dataset.action}

        console.log("Seleccionaste:", action)

        switch(appState.currentView){
            case "home":
                if(action === "menustory") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Historias");
                    speechSynthesis.speak(utterance);
                    goToView("menustory");
                }
                if(action === "ManageGestures") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Sensibilidad de Gestos");
                    speechSynthesis.speak(utterance);
                    goToView("ManageGestures");
                }
                break;
            case "menustory":
                if(action === "home") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver al menú principal");
                    speechSynthesis.speak(utterance);
                    goToView("home");
                }
                if(action === "new_story") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Historia Aleatoria");
                    utterance.onend = () => {sendMessage("story", "random");};
                    speechSynthesis.speak(utterance);
                }
                if(action === "record_story") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Lista de Historias");
                    utterance.onend = () => {sendMessage("story", "list");};
                    speechSynthesis.speak(utterance);
                }
                break;
            case "ManageGestures":
                if(action === "ManageGestures"){}
                if(action === "home") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver al menú principal");
                    speechSynthesis.speak(utterance);
                    goToView("home");
                }
                break;}

        return;

    // Navegación tipo historias
    } else if (kind_view === "story"){

        const finalOption = optionFromVoice || selectedOption;
        if (!finalOption) return;

        const el = document.getElementById("option-" + finalOption);
        if (!action){
            action = el.dataset.action}

        console.log("Seleccionaste:", action)

        // animación visual
        el.classList.add("confirm")
        setTimeout(()=>{el.classList.remove("confirm")},800)

        switch(appState.currentView){
            case "story":
                if (action === "left") chooseLeft();
                if (action === "right") chooseRight();
                if (action === "pause") pauseStory();
                if (action === "resume") resumeStory();
                if (action === "reset") resetStory();    
                if (action === "return") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver al menú de historias");
                    speechSynthesis.speak(utterance);
                    goToView("menustory");
                    }
            break;
        }
    }
}