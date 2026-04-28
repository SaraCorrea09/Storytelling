let currentStory = null;
let currentNode = null;
let startNode = null;
let typingController = {id: 0};
let typingState = {
    id: 0,
    paused: false,
    index: 0,
    text: "",
    element: null
};

function loadStory(storyData) {
    currentStory = storyData;
    currentNode = storyData.start;
    startNode = storyData.start;
    renderStory();
}

async function renderStory() {
    if (!currentStory || !currentNode) return;

    typingController.id++;

    const currentId = typingController.id;

    isTyping = true;
    document.getElementById("option-up").innerText = "Pausar";
    document.getElementById("option-up").dataset.action = "pause";

    typingState.paused = false;
    typingState.index = 0;

    const node = currentStory.nodes[currentNode];

    const text = document.getElementById("scene-text");

    document.getElementById("scene-title").innerText = currentStory.title;

    setOptionsEnabled(false);
    renderOptions(["-"]);

    speechSynthesis.cancel();

    await speakAndWrite(node.text, text, currentId);

    if (currentId !== typingController.id) return;

    renderOptions(node.options);
    setOptionsEnabled(true);

    isTyping = false;
    document.getElementById("option-up").innerText = "Reiniciar";
    document.getElementById("option-up").dataset.action = "reset";
}

function renderOptions(options) {
    const left = document.getElementById("option-left");
    const right = document.getElementById("option-right");

    left.innerText = "";
    right.innerText = "";

    if (options.length === 0) {
        left.innerText = "Fin de la historia";
        right.innerText = "Fin de la historia";
        return;
    }

    if (options.length === 1) {
        left.innerText = "Contando Historia";
        right.innerText = "Contando Historia";
        return;
    }

    if (options[0]) {
        left.innerText = options[0].text;
    }

    if (options[1]) {
        right.innerText = options[1].text;
    }
}

function chooseLeft() {
    if (isTyping) return;

    const node = currentStory.nodes[currentNode];

    if (!node.options[0]) return;

    currentNode = node.options[0].next;
    resumeStory(true);
    speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance("Seleccionaste "+ node.options[0].text);
    utterance.onend = () => {renderStory();};
    speechSynthesis.speak(utterance);
}

function chooseRight() {
    if (isTyping) return;

    const node = currentStory.nodes[currentNode];

    if (!node.options[1]) return;

    currentNode = node.options[1].next;
    resumeStory(true);
    speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance("Seleccionaste "+ node.options[1].text);
    utterance.onend = () => {renderStory();};
    speechSynthesis.speak(utterance);
}

function setOptionsEnabled(enabled) {
    const left = document.getElementById("option-left");
    const right = document.getElementById("option-right");

    if (enabled) {
        left.style.pointerEvents = "auto";
        right.style.pointerEvents = "auto";
        left.style.opacity = "1";
        right.style.opacity = "1";
    } else {
        left.style.pointerEvents = "none";
        right.style.pointerEvents = "none";
        left.style.opacity = "0.4";
        right.style.opacity = "0.4";
    }
}

function resetStory() {
    if (!currentStory) return;

    pauseStory(true);
    speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance("Reiniciando historia");
    utterance.onend = () => {currentNode = currentStory.start; renderStory();};
    speechSynthesis.speak(utterance);
}

function pauseStory(fromReset = false) {
    if (!isTyping) return;

    if (!fromReset) {
    speechSynthesis.pause();}

    typingState.paused = true;
    document.getElementById("option-up").innerText = "Reanudar";
    document.getElementById("option-up").dataset.action = "resume";
}

function resumeStory(fromChoice = false) {
    if (!isTyping) return;

    if (!fromChoice) {
    speechSynthesis.resume();}

    typingState.paused = false;
    document.getElementById("option-up").innerText = "Pausar";
    document.getElementById("option-up").dataset.action = "pause";
}

function speakAndWrite(text, element, currentId) {
    return new Promise((resolve) => {

        element.textContent = "";

        let lastIndex = 0;

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onboundary = (event) => {
            if (currentId !== typingController.id) return;

            if (event.name === "word") {
                const charIndex = event.charIndex;

                element.textContent = text.substring(0, charIndex);
                lastIndex = charIndex;
            }
        };

        utterance.onend = () => {
            element.textContent = text;
            resolve();
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    });
}