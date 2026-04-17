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

    typingState.paused = false;
    typingState.index = 0;

    const node = currentStory.nodes[currentNode];

    const title = document.getElementById("scene-title");
    const text = document.getElementById("scene-text");
    const downOption = document.getElementById("option-down");

    if (startNode === currentNode) {
        downOption.innerText = "Volver";
        downOption.dataset.action = "return";
    } else {
        downOption.innerText = "Reiniciar";
        downOption.dataset.action = "reset";
    }

    title.innerText = currentStory.title;

    setOptionsEnabled(false);
    renderOptions(["-"]);

    await typeWriter(node.text, text, 10, currentId);

    if (currentId !== typingController.id) return;

    renderOptions(node.options);
    setOptionsEnabled(true);

    isTyping = false;
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
    renderStory();
}

function chooseRight() {
    if (isTyping) return;

    const node = currentStory.nodes[currentNode];

    if (!node.options[1]) return;

    currentNode = node.options[1].next;
    renderStory();
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

    currentNode = currentStory.start;
    renderStory();
}

function pauseStory() {
    typingState.paused = true;
    document.getElementById("option-up").innerText = "Reanudar";
    document.getElementById("option-up").dataset.action = "resume";
}

function resumeStory() {
    typingState.paused = false;
    document.getElementById("option-up").innerText = "Pausar";
    document.getElementById("option-up").dataset.action = "pause";
}

function typeWriter(text, element, speed = 20, currentId) {
    return new Promise((resolve) => {

        typingState.text = text;
        typingState.element = element;
        typingState.index = 0;

        function write() {
            if (currentId !== typingController.id) return;

            if (typingState.paused) {
                setTimeout(write, speed);
                return;
            }

            if (typingState.index < typingState.text.length) {
                element.textContent += typingState.text[typingState.index];
                typingState.index++;
                setTimeout(write, speed);
            } else {
                resolve();
            }
        }

        element.textContent = "";
        write();
    });
}