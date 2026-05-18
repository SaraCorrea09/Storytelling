// ===============================
// SENSIBILIDAD
// ===============================

let stateGestureBlink = null;
let stateGestureVertical = null;
let stateGestureHorizontal = null;
let parameterGestureBlink = null;
let parameterGestureUp = null;
let parameterGestureDown = null;
let parameterGestureRight = null;
let parameterGestureLeft = null;

function setBlinkSensitivity(level) {
    stateGestureBlink = level;
    if (level === "high")   parameterGestureBlink = 300
    if (level === "medium") parameterGestureBlink = 450
    if (level === "low")    parameterGestureBlink = 600
}

function setVerticalSensitivity(level) {
    stateGestureVertical = level;
    if (level === "high")   { parameterGestureUp = 0.06; parameterGestureDown = 0.06 }
    if (level === "medium") { parameterGestureUp = 0.10; parameterGestureDown = 0.10 }
    if (level === "low")    { parameterGestureUp = 0.15; parameterGestureDown = 0.15 }
}

function setHorizontalSensitivity(level) {
    stateGestureHorizontal = level;
    if (level === "high")   { parameterGestureRight = -13; parameterGestureLeft = 13  }
    if (level === "medium") { parameterGestureRight = -20; parameterGestureLeft = 20  }
    if (level === "low")    { parameterGestureRight = -28; parameterGestureLeft = 28  }
}

// Predefinido al cargar
setBlinkSensitivity("medium")
setVerticalSensitivity("medium")
setHorizontalSensitivity("medium")


let parameterAudio = true;
let recognition = null;
let isListening = false;

const synth = window.speechSynthesis;
let utterance = null;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: parameterAudio
        });

        const video = document.getElementById("camera");
        video.srcObject = stream;

        console.log("Cámara activada");
        showStatus("camera-msg", "Cámara activada", "ok", 2000);
        startFaceDetection(video);
        startSpeechRecognition();

    } catch (error) {
        console.error("No se pudo acceder a la cámara:", error);
        showStatus("camera-msg", "No se pudo activar la cámara", "error");
    }
}


// ===============================
// RECONOCIMIENTO DE VOZ
// ===============================
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Tu navegador no soporta reconocimiento de voz");
        showStatus("camera-msg", "Voz no soportada", "error");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        console.log("Micrófono activo");
        showStatus("camera-msg", "Micrófono activo", "ok", 2000);
    };

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (!result.isFinal) return;
        const transcript = result[0].transcript.trim();
        handleVoice(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Error en reconocimiento:", event.error);
    };

    recognition.onend = () => {
        console.log("Reconocimiento detenido, reiniciando...");
        if (isListening) {
            console.log("Reiniciando...");
            recognition.start();
        }
    };

    recognition.start();
    isListening = true;
}


// ===============================
// ESTADOS DEL SISTEMA
// ===============================
let faceState = false
let blinkStart = null
let headDown = false


// ===============================
// DETECCIÓN DE ROSTRO (MediaPipe)
// ===============================
function startFaceDetection(video) {
    const faceDetection = new FaceDetection({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
    });

    faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.6
    });

    const faceMesh = startGestureDetection(video);

    faceDetection.onResults(results => {
        if (results.detections.length > 0) {
            if (!faceState) {
                faceState = true;
                console.log("Rostro detectado");
                showStatus("face-msg", "Rostro detectado", "ok");
                sendMessage("face_detected", "update", true)
            }
        } else {
            if (faceState) {
                faceState = false;
                console.log("No se detecta rostro");
                showStatus("face-msg", "No se detecta rostro", "error");
                sendMessage("face_detected", "update", false)
            }
        }
    });

    const camera = new Camera(video, {
        onFrame: async () => {
            await faceDetection.send({ image: video });
            await faceMesh.send({ image: video });
        },
        width: 640,
        height: 480
    });

    camera.start();
}

window.addEventListener("load", startCamera);


// ===============================
// INICIALIZAR DETECCIÓN DE GESTOS
// ===============================
function startGestureDetection(video) {
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        }
    })

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    })

    faceMesh.onResults(results => {
        if (!faceState) return
        if (results.multiFaceLandmarks.length === 0) return

        const landmarks = results.multiFaceLandmarks[0]

        const kind_view = getKindView(appState.currentView)
        if (kind_view === "story") {
            detectHeadTilt(landmarks)
        }
        detectHeadVertical(landmarks)
        detectBlink(landmarks)
    })

    return faceMesh
}


// ===============================
// HEAD TILT (con estado)
// ===============================

let angleHistory = []
const ANGLE_WINDOW = 5
let tiltState = "neutral" // "left", "right", "neutral"

function smoothAngle(angle) {
    angleHistory.push(angle)
    if (angleHistory.length > ANGLE_WINDOW) angleHistory.shift()
    return angleHistory.reduce((a, b) => a + b, 0) / angleHistory.length
}

function detectHeadTilt(landmarks) {
    if (gestureCooldown) return

    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const dx = rightEye.x - leftEye.x
    const dy = rightEye.y - leftEye.y

    const angleRaw = Math.atan2(dy, dx) * 180 / Math.PI
    const angle = smoothAngle(angleRaw)

    const deadZone = 5

    if (angle > parameterGestureLeft + deadZone) {
        if (tiltState !== "left") {
            tiltState = "left"
            console.log("Cabeza izquierda")
            handleGesture("head_left")
        }
        return
    }

    if (angle < parameterGestureRight - deadZone) {
        if (tiltState !== "right") {
            tiltState = "right"
            console.log("Cabeza derecha")
            handleGesture("head_right")
        }
        return
    }

    tiltState = "neutral"
}


// ===============================
// HEAD VERTICAL (corregido)
// ===============================

let verticalState = "neutral"

// FIX: flag de recuperación — evita disparar el gesto contrario
// al volver de un gesto a la posición neutral
let verticalRecovering = false

// baseline adaptativo (posición normal del usuario)
let baselineVertical = null
let frozenVerticalBaseline = null

function detectHeadVertical(landmarks) {
    if (gestureCooldown) return

    const nose       = landmarks[1]
    const leftEye    = landmarks[33]
    const rightEye   = landmarks[263]
    const eyeCenterY = (leftEye.y + rightEye.y) / 2
    const faceHeight = Math.abs(landmarks[10].y - landmarks[152].y)
    const diffRaw    = (nose.y - eyeCenterY) / faceHeight

    if (baselineVertical === null) {
        baselineVertical = diffRaw
        frozenVerticalBaseline = diffRaw
        return
    }

    // FIX: solo actualizar el baseline cuando la cabeza está en reposo neutral
    // Evita que el baseline "aprenda" posiciones inclinadas como nueva neutral
    if (verticalState === "neutral" && !verticalRecovering) {
        baselineVertical = 0.98 * baselineVertical + 0.02 * diffRaw
    }

    if (frozenVerticalBaseline !== null && baselineSamples.length < BASELINE_INIT_SAMPLES) {
        frozenVerticalBaseline = 0.98 * frozenVerticalBaseline + 0.02 * diffRaw
    }

    const diff = diffRaw - baselineVertical
    const deadZone = 0.015

    // ── ABAJO ──
    if (diff > parameterGestureDown) {
        if (verticalState !== "down") {
            verticalState = "down"
            verticalRecovering = false
            headDown = true
            console.log("Cabeza abajo")
            handleGesture("head_down")
        }
        return
    }

    // FIX: al salir de "down", entrar en modo recuperación
    // El umbral de salida es la mitad del umbral de entrada (histéresis)
    // Esto evita disparar "head_up" mientras la cabeza simplemente regresa
    if (verticalState === "down" && diff < parameterGestureDown * 0.5) {
        verticalState = "neutral"
        verticalRecovering = true
        headDown = false
        // NO disparar head_up aquí — es solo recuperación
        return
    }

    // ── ARRIBA ──
    // Solo dispara si la cabeza está en neutral limpio Y no está recuperando
    if (diff < -parameterGestureUp && !verticalRecovering) {
        if (verticalState === "neutral") {
            verticalState = "up"
            headDown = false
            console.log("Cabeza arriba")
            handleGesture("head_up")
        }
        return
    }

    // FIX: análogamente, al salir de "up" entrar en recuperación
    if (verticalState === "up" && diff > -parameterGestureUp * 0.5) {
        verticalState = "neutral"
        verticalRecovering = true
        return
    }

    // ── NEUTRAL ──
    // FIX: usar umbral más estricto para declarar neutral limpio
    // Solo se limpia la recuperación cuando diff está muy cerca de 0
    if (Math.abs(diff) < deadZone) {
        verticalRecovering = false
        verticalState = "neutral"
        headDown = false
    }
}


// ===============================
// DETECCIÓN PARPADEO LARGO (corregido)
// ===============================

let earHistory = []
const EAR_WINDOW = 5

let baselineEAR = null
let baselineSamples = []
const BASELINE_INIT_SAMPLES = 30

let eyeState = "open"
let openFrames = 0

// FIX: separar raw y suavizado para isSuddenDrop
let lastSmoothedEAR = null

// FIX: cooldown independiente para parpadeo
// evita que el gestureCooldown global genere ventanas sucias
let blinkCooldown = false

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function getEAR(lm) {
    const v1L = distance(lm[159], lm[145])
    const v2L = distance(lm[158], lm[153])
    const hL  = distance(lm[33],  lm[133])
    const earL = (v1L + v2L) / (2.0 * hL)

    const v1R = distance(lm[386], lm[374])
    const v2R = distance(lm[385], lm[380])
    const hR  = distance(lm[362], lm[263])
    const earR = (v1R + v2R) / (2.0 * hR)

    return (earL + earR) / 2
}

function smoothEAR(ear) {
    earHistory.push(ear)
    if (earHistory.length > EAR_WINDOW) earHistory.shift()
    return earHistory.reduce((a, b) => a + b, 0) / earHistory.length
}

// FIX: solo agregar al baseline muestras de ojos claramente abiertos
// Si el usuario parpadeó durante la inicialización, el baseline no queda sesgado
function updateBaseline(ear) {
    if (baselineSamples.length < BASELINE_INIT_SAMPLES) {
        // Solo acepta muestras que no sean anómalamante bajas
        const minAcceptable = baselineSamples.length === 0
            ? 0
            : baselineSamples.reduce((a, b) => a + b, 0) / baselineSamples.length * 0.75
        if (ear > minAcceptable) {
            baselineSamples.push(ear)
        }
        if (baselineSamples.length === BASELINE_INIT_SAMPLES) {
            const sorted = [...baselineSamples].sort((a, b) => a - b)
            baselineEAR = sorted[Math.floor(sorted.length * 0.85)]
            console.log("Baseline EAR establecido:", baselineEAR.toFixed(3))
        }
        return
    }
    // FIX: actualizar baseline solo con ojos claramente abiertos (0.85 en vez de 0.80)
    // y con tasa más conservadora (0.003 en vez de 0.005)
    if (ear > baselineEAR * 0.85) {
        baselineEAR = 0.997 * baselineEAR + 0.003 * ear
    }
}

function isHeadTurned(landmarks) {
    const nose      = landmarks[1]
    const leftFace  = landmarks[234]
    const rightFace = landmarks[454]
    const distLeft  = Math.abs(nose.x - leftFace.x)
    const distRight = Math.abs(nose.x - rightFace.x)
    const ratio     = distLeft / distRight
    return ratio < 0.5 || ratio > 2
}

function isLookingDownForBlink(landmarks) {
    if (baselineVertical === null) return false
    const nose       = landmarks[1]
    const leftEye    = landmarks[33]
    const rightEye   = landmarks[263]
    const eyeCenterY = (leftEye.y + rightEye.y) / 2
    const faceHeight = Math.abs(landmarks[10].y - landmarks[152].y)
    const diffRaw    = (nose.y - eyeCenterY) / faceHeight
    const diff       = diffRaw - frozenVerticalBaseline
    return diff > 0.015
}

// FIX: comparar EAR suavizado contra EAR suavizado anterior (no raw)
// El original comparaba raw vs raw, produciendo falsos positivos por ruido frame a frame
function isSuddenDrop(smoothed) {
    if (lastSmoothedEAR === null) return false
    const drop = lastSmoothedEAR - smoothed
    return drop > lastSmoothedEAR * 0.35
}

function detectBlink(landmarks) {
    // FIX: cooldown propio además del global
    if (blinkCooldown || gestureCooldown) return

    if (isHeadTurned(landmarks) || isLookingDownForBlink(landmarks)) {
        eyeState       = "open"
        openFrames     = 0
        blinkStart     = null
        earHistory     = []
        lastSmoothedEAR = null
        return
    }

    const earRaw = getEAR(landmarks)

    updateBaseline(earRaw)
    if (!baselineEAR) return

    // FIX: suavizar primero, luego comparar suavizado vs suavizado anterior
    const ear = smoothEAR(earRaw)

    // Detectar caída brusca ANTES de actualizar lastSmoothedEAR
    const suddenDrop = isSuddenDrop(ear)
    lastSmoothedEAR = ear

    const threshold = baselineEAR * 0.60

    // ── OJO ABIERTO ──
    if (ear > threshold) {
        openFrames++
        if (eyeState !== "open") {
            eyeState   = "open"
            blinkStart = null
        }
        return
    }

    if (openFrames < 3) return

    // FIX: ignorar si fue caída brusca (basada en suavizado, no raw)
    if (suddenDrop) {
        console.log("Caída brusca ignorada, EAR suavizado:", ear.toFixed(3))
        eyeState        = "open"
        openFrames      = 0
        blinkStart      = null
        earHistory      = []
        lastSmoothedEAR = null
        return
    }

    // ── OJO CERRANDO ──
    if (eyeState === "open") {
        eyeState   = "closing"
        blinkStart = Date.now()
    }

    if (blinkStart) {
        const duration = Date.now() - blinkStart
        if (duration > parameterGestureBlink) {
            console.log("Parpadeo largo detectado:", duration, "ms")
            handleGesture("long_blink")

            // FIX: activar cooldown independiente para parpadeo
            blinkCooldown = true
            setTimeout(() => { blinkCooldown = false }, 800)

            blinkStart      = null
            eyeState        = "open"
            openFrames      = 0
            earHistory      = []
            lastSmoothedEAR = null
        }
    }
}


// ===============================
// STATUS DE LA CÁMARA Y ROSTRO
// ===============================
function showStatus(elementId, message, type, duration = 0) {
    const el = document.getElementById(elementId);
    el.className = "status-msg " + (type === "ok" ? "status-ok" : "status-error");
    el.innerText = message;

    if (duration > 0) {
        setTimeout(() => {
            el.innerText = "";
            el.className = "status-msg";
        }, duration);
    }
}