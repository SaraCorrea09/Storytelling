//Parametros de configuracion de gestos
let parameterGestureRight = -20;
let parameterGestureLeft = 20;
let parameterGestureUp = 0.10;
let parameterGestureDown = 0.10;
let parameterGestureBlink = 450;

let parameterAudio = true;
let recognition = null;
let isListening = false;

const synth = window.speechSynthesis;
let utterance = null;

async function startCamera() {

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: parameterAudio});

        const video = document.getElementById("camera");
        video.srcObject = stream;

        console.log("Cámara activada");
        showStatus("camera-msg","Cámara activada","ok",2000);
        startFaceDetection(video);
        startSpeechRecognition();

    } catch (error) {
        console.error("No se pudo acceder a la cámara:", error);
        showStatus("camera-msg","No se pudo activar la cámara","error");}}


// RECONOCIMIENTO DE VOZ
function startSpeechRecognition() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Tu navegador no soporta reconocimiento de voz");
        showStatus("camera-msg","Voz no soportada","error");
        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "es-CO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        console.log("Micrófono activo");
        showStatus("camera-msg","Micrófono activo","ok",2000);
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

// ESTADOS DEL SISTEMA
let faceState = false
let blinkStart = null
let headDown = false

// Deteccion de rostro con MediaPipe
function startFaceDetection(video){

    const faceDetection = new FaceDetection({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }});

    faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.6});

    // INICIAR DETECCION DE GESTOS
    const faceMesh = startGestureDetection(video);

    faceDetection.onResults(results => {

        if(results.detections.length > 0){

        if(!faceState){
            faceState = true;
            console.log("Rostro detectado");
            showStatus("face-msg","Rostro detectado","ok");
            sendMessage("face_detected", "update", true)
            }}
        else{
            if(faceState){
                faceState = false;
                console.log("No se detecta rostro");
                showStatus("face-msg","No se detecta rostro","error");
                sendMessage("face_detected", "update", false)
            }}
        });

    const camera = new Camera(video, {
        onFrame: async () => {
            await faceDetection.send({image: video});
            await faceMesh.send({image: video});},
        width: 640,
        height: 480});

    camera.start();}

window.addEventListener("load", startCamera);


// INICIALIZAR DETECCION DE GESTOS
function startGestureDetection(video){

    const faceMesh = new FaceMesh({
        locateFile: (file)=>{
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        }})

    faceMesh.setOptions({
        maxNumFaces:1,
        refineLandmarks:true,
        minDetectionConfidence:0.6,
        minTrackingConfidence:0.6})


    faceMesh.onResults(results=>{

        // SOLO analizar gestos si hay rostro
        if(!faceState) return
        if(results.multiFaceLandmarks.length === 0) return

        const landmarks = results.multiFaceLandmarks[0]

        const kind_view = getKindView(appState.currentView)
        if (kind_view === "story"){
            detectHeadTilt(landmarks)
        }
        detectHeadVertical(landmarks)
        detectBlink(landmarks)})

    return faceMesh
}


// ===============================
// HEAD TILT (con estado)
// ===============================

let angleHistory = []
const ANGLE_WINDOW = 5

let tiltState = "neutral" // "left", "right", "neutral"

function smoothAngle(angle){
    angleHistory.push(angle)
    if(angleHistory.length > ANGLE_WINDOW){
        angleHistory.shift()
    }
    return angleHistory.reduce((a,b)=>a+b,0)/angleHistory.length
}

function detectHeadTilt(landmarks){

    if(gestureCooldown) return

    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const dx = rightEye.x - leftEye.x
    const dy = rightEye.y - leftEye.y

    const angleRaw = Math.atan2(dy, dx) * 180 / Math.PI
    const angle = smoothAngle(angleRaw)

    const deadZone = 5

    if(angle > parameterGestureLeft + deadZone){
        if(tiltState !== "left"){
            tiltState = "left"
            console.log("Cabeza izquierda")
            handleGesture("head_left")
        }
        return
    }

    if(angle < parameterGestureRight - deadZone){
        if(tiltState !== "right"){
            tiltState = "right"
            console.log("Cabeza derecha")
            handleGesture("head_right")
        }
        return
    }

    // Zona neutral
    tiltState = "neutral"
}

// ===============================
// HEAD VERTICAL (con estado real)
// ===============================
let verticalState = "neutral"

// baseline de referencia (posición normal del usuario)
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

    baselineVertical = 0.98 * baselineVertical + 0.02 * diffRaw

    if (frozenVerticalBaseline !== null && baselineSamples.length < BASELINE_INIT_SAMPLES) {
        frozenVerticalBaseline = 0.98 * frozenVerticalBaseline + 0.02 * diffRaw
    }

    const diff = diffRaw - baselineVertical
    const deadZone = 0.015

    // ABAJO
    if (diff > parameterGestureDown) {
        if (verticalState !== "down") {
            verticalState = "down"
            headDown = true
            console.log("Cabeza abajo")
            handleGesture("head_down")
        }
        return
    }

    // ARRIBA — solo si ya estuvo en neutral antes (no directo desde down)
    if (diff < -parameterGestureUp) {
        if (verticalState === "neutral") {  // ← único cambio clave
            verticalState = "up"
            headDown = false
            console.log("Cabeza arriba")
            handleGesture("head_up")
        }
        return
    }

    // NEUTRAL
    if (Math.abs(diff) < deadZone) {
        verticalState = "neutral"
        headDown = false
    }

}

// ===============================
// DETECCION PARPADEO LARGO
// ===============================

let earHistory = []
const EAR_WINDOW = 5

let baselineEAR = null
let baselineSamples = []
const BASELINE_INIT_SAMPLES = 30

let eyeState = "open"
let openFrames = 0
let lastEAR = null  // ← para detectar caídas bruscas

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

function updateBaseline(ear) {
    if (baselineSamples.length < BASELINE_INIT_SAMPLES) {
        baselineSamples.push(ear)
        if (baselineSamples.length === BASELINE_INIT_SAMPLES) {
            const sorted = [...baselineSamples].sort((a, b) => a - b)
            baselineEAR = sorted[Math.floor(sorted.length * 0.85)]
        }
        return
    }
    if (ear > baselineEAR * 0.80) {
        baselineEAR = 0.995 * baselineEAR + 0.005 * ear
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
    const diff = diffRaw - frozenVerticalBaseline

    return diff > 0.015  // ← mucho más sensible que 0.05
}

// ← NUEVA: detecta si el EAR cayó demasiado rápido para ser un parpadeo real
function isSuddenDrop(ear) {
    if (lastEAR === null) return false
    const drop = lastEAR - ear
    // Un parpadeo real baja gradualmente. Caída > 40% en 1 frame = movimiento brusco
    return drop > lastEAR * 0.40
}

function detectBlink(landmarks) {
    if (gestureCooldown) return

    if (isHeadTurned(landmarks) || isLookingDownForBlink(landmarks)) {
        eyeState  = "open"
        openFrames = 0
        blinkStart = null
        earHistory = []
        lastEAR   = null
        return
    }

    const earRaw = getEAR(landmarks)

    // Guardar EAR antes de suavizar para comparar frame a frame
    const prevEAR = lastEAR
    lastEAR = earRaw

    updateBaseline(earRaw)
    if (!baselineEAR) return

    const ear = smoothEAR(earRaw)
    const threshold = baselineEAR * 0.60

    // OJO ABIERTO
    if (ear > threshold) {
        openFrames++
        if (eyeState !== "open") {
            eyeState  = "open"
            blinkStart = null
        }
        return
    }

    if (openFrames < 3) return

    // ← Ignorar si fue una caída brusca (movimiento, no parpadeo)
    if (isSuddenDrop(earRaw)) {
        console.log("Caída brusca ignorada, EAR:", earRaw.toFixed(3))
        eyeState  = "open"
        openFrames = 0
        blinkStart = null
        earHistory = []
        lastEAR   = null
        return
    }

    // OJO CERRANDO
    if (eyeState === "open") {
        eyeState  = "closing"
        blinkStart = Date.now()
    }

    if (blinkStart) {
        const duration = Date.now() - blinkStart
        if (duration > parameterGestureBlink) {
            console.log("Parpadeo largo:", duration, "ms")
            handleGesture("long_blink")

            blinkStart = null
            eyeState  = "open"
            openFrames = 0
            earHistory = []
            lastEAR   = null
        }
    }
}

// STATUS DE LA CAMARA Y ROSTRO
function showStatus(elementId, message, type, duration=0){

    const el = document.getElementById(elementId);
    el.className = "status-msg " + (type === "ok" ? "status-ok" : "status-error");
    el.innerText = message;

    if(duration > 0){
        setTimeout(()=>{
        el.innerText="";
        el.className="status-msg";
    }, duration);}}