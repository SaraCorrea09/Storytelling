let currentGestureSensitivity = null;

function managerTitleSensitivity(From) {

    let title = "Selector de Sensibilidad";
    let highMessage = "Sensibilidad Alta";
    let mediumMessage = "Sensibilidad Media";
    let lowMessage = "Sensibilidad Baja";

    if (From === "BlinkSensitivity") {
        title = "Sensibilidad de Parpadeo";
        currentGestureSensitivity = "BlinkSensitivity";
        if (stateGestureBlink === "high") {
            highMessage = "Sensibilidad Alta ACTIVA";
        } else if (stateGestureBlink === "medium") {
            mediumMessage = "Sensibilidad Media ACTIVA ";
        } else if (stateGestureBlink === "low") {
            lowMessage = "Sensibilidad Baja ACTIVA ";
        }
    }
    if (From === "VerticalSensitivity") {
        title = "Sensibilidad de Inclinación Vertical";
        currentGestureSensitivity = "VerticalSensitivity";
        if (stateGestureVertical === "high") {
            highMessage = "Sensibilidad Alta ACTIVA";
        } else if (stateGestureVertical === "medium") {
            mediumMessage = "Sensibilidad Media ACTIVA ";
        } else if (stateGestureVertical === "low") {
            lowMessage = "Sensibilidad Baja ACTIVA ";
        }
    }
    if (From === "HorizontalSensitivity") {
        title = "Sensibilidad de Inclinación Horizontal";
        currentGestureSensitivity = "HorizontalSensitivity";
        if (stateGestureHorizontal === "high") {
            highMessage = "Sensibilidad Alta ACTIVA";
        } else if (stateGestureHorizontal === "medium") {
            mediumMessage = "Sensibilidad Media ACTIVA ";
        } else if (stateGestureHorizontal === "low") {
            lowMessage = "Sensibilidad Baja ACTIVA ";
        }
    }
    if (From === "home") {
        currentGestureSensitivity = null;
    }

    document.getElementById("sensitivity-title").innerText = title;
    document.getElementById("option-high").innerText = highMessage;
    document.getElementById("option-medium").innerText = mediumMessage;
    document.getElementById("option-low").innerText = lowMessage;
}

function selectOptionSensitivity(levelSensitivity) {
    if (!currentGestureSensitivity) return;

    if (currentGestureSensitivity === "BlinkSensitivity") {
        if (levelSensitivity === "HighSensitivity") {
            setBlinkSensitivity("high");
        } else if (levelSensitivity === "MediumSensitivity") {
            setBlinkSensitivity("medium");
        } else if (levelSensitivity === "LowSensitivity") {
            setBlinkSensitivity("low");
        }
        managerTitleSensitivity("BlinkSensitivity");
    }
    if (currentGestureSensitivity === "VerticalSensitivity") {
        if (levelSensitivity === "HighSensitivity") {
            setVerticalSensitivity("high");
        } else if (levelSensitivity === "MediumSensitivity") {
            setVerticalSensitivity("medium");
        } else if (levelSensitivity === "LowSensitivity") {
            setVerticalSensitivity("low");
        }
        managerTitleSensitivity("VerticalSensitivity");
    }
    if (currentGestureSensitivity === "HorizontalSensitivity") {
        if (levelSensitivity === "HighSensitivity") {
            setHorizontalSensitivity("high");
        } else if (levelSensitivity === "MediumSensitivity") {
            setHorizontalSensitivity("medium");
        } else if (levelSensitivity === "LowSensitivity") {
            setHorizontalSensitivity("low");
        }
        managerTitleSensitivity("HorizontalSensitivity");
    }
}