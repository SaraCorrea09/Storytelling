let gestureCooldown = false
let selectedOption = null

function managerAnswer(data){
    if(data.type === "story" && data.action === "view"){
        goToView("story")
        loadStory(data.payload)
    }
    if(data.type === "story" && data.action === "list"){
        goToView("StoriesList")
        loadStoriesList(data.payload)
    }
}

function handleVoice(text) {

    text = text.toLowerCase();

    const stateOptions = {
        "home": {"menustory": "Historias", "ManageGestures": "Sensibilidad de Gestos"},
        "menustory": {"new_story": "Historia Aleatoria", "record_story": "Lista de Historias", "home": "Volver"},
        "ManageGestures": {"home": "Volver", "BlinkSensitivity": "Parpadeo de Confirmación", "VerticalSensitivity": "Inclinación Vertical", "HorizontalSensitivity": "Inclinación Horizontal"},
        "SensitivitySelector": {"ManageGestures": "Volver", "HighSensitivity": "Sensibilidad Alta", "MediumSensitivity": "Sensibilidad Media", "LowSensitivity": "Sensibilidad Baja"},
        "story": {"left": "Opción Izquierda", "right": "Opción Derecha", "pause": "Pausar", "reset": "Reiniciar", "return": "Volver", "resume": "reanudar"},
        "StoriesList": {"story_1": "Primera Historia", "story_2": "Segunda Historia", "story_3": "Tercera Historia", "story_4": "Cuarta Historia", "menustory": "Volver"}
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

let lastView = null;
let lastAction = null;
let isConfirming = false;

function confirmSelection(action = null, optionFromVoice = null){

    if (isConfirming) return;
    isConfirming = true;
    setTimeout(() => { isConfirming = false; }, 2000);

    lastView = appState.currentView;
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
                if(action === "BlinkSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Parpadeo de Confirmación");
                    speechSynthesis.speak(utterance);
                    goToView("SensitivitySelector");
                    managerTitleSensitivity("BlinkSensitivity");
                }
                if(action === "VerticalSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Inclinación Vertical");
                    speechSynthesis.speak(utterance);
                    goToView("SensitivitySelector");
                    managerTitleSensitivity("VerticalSensitivity");
                }
                if(action === "HorizontalSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Inclinación Horizontal");
                    speechSynthesis.speak(utterance);
                    goToView("SensitivitySelector");
                    managerTitleSensitivity("HorizontalSensitivity");
                }
                if(action === "home") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver al menú principal");
                    speechSynthesis.speak(utterance);
                    goToView("home");
                }
                break;
            case "SensitivitySelector":

                if (lastView === appState.currentView && lastAction === action) return;
                lastView = appState.currentView;
                lastAction = action;

                if(action === "HighSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Sensibilidad Alta");
                    speechSynthesis.speak(utterance);
                    selectOptionSensitivity("HighSensitivity");
                }
                if(action === "MediumSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Sensibilidad Media");
                    speechSynthesis.speak(utterance);
                    selectOptionSensitivity("MediumSensitivity");
                }
                if(action === "LowSensitivity"){
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Sensibilidad Baja");
                    speechSynthesis.speak(utterance);
                    selectOptionSensitivity("LowSensitivity");
                }
                if(action === "ManageGestures") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver a Sensibilidad de Gestos");
                    speechSynthesis.speak(utterance);
                    goToView("ManageGestures");
                    managerTitleSensitivity("home");
                }
                break;
            case "StoriesList":
                if(action === "story_1") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Primera Historia");
                    utterance.onend = () => {sendMessage("story", "get", storySlotIds["one"]);};
                    speechSynthesis.speak(utterance);
                }
                if(action === "story_2") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Segunda Historia");
                    utterance.onend = () => {sendMessage("story", "get", storySlotIds["two"]);};
                    speechSynthesis.speak(utterance);
                }
                if(action === "story_3") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Tercera Historia");
                    utterance.onend = () => {sendMessage("story", "get", storySlotIds["three"]);};
                    speechSynthesis.speak(utterance);
                }
                if(action === "story_4") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Cuarta Historia");
                    utterance.onend = () => {sendMessage("story", "get", storySlotIds["four"]);};
                    speechSynthesis.speak(utterance);
                }
                if(action === "menustory") {
                    speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(StartAudio + "Volver a Menú de Historias");
                    speechSynthesis.speak(utterance);
                    goToView("menustory");
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