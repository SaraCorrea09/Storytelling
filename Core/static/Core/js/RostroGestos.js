//Parametros de configuracion de gestos
let parameterGestureRight = -20;
let parameterGestureLeft = 20;
let parameterGestureUp = 0.04;
let parameterGestureDown = 0.10;
let parameterGestureBlink = 250;

let parameterAudio = true;
let recognition = null;

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
        recognition.start();
    };

    recognition.start();
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

function detectHeadVertical(landmarks){

    if(gestureCooldown) return

    const nose = landmarks[1]
    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const eyeCenterY = (leftEye.y + rightEye.y) / 2
    const faceHeight = Math.abs(landmarks[10].y - landmarks[152].y)

    const diffRaw = (nose.y - eyeCenterY) / faceHeight

    // CALIBRACIÓN AUTOMÁTICA (solo al inicio o si aún no hay baseline)
    if(baselineVertical === null){
        baselineVertical = diffRaw
        return
    }

    // Suavizar baseline lentamente (adaptación)
    baselineVertical = 0.98 * baselineVertical + 0.02 * diffRaw

    // Diferencia real respecto a posición neutral
    const diff = diffRaw - baselineVertical

    const deadZone = 0.015

    // ABAJO
    if(diff > parameterGestureDown){
        if(verticalState !== "down"){
            verticalState = "down"
            headDown = true
            console.log("Cabeza abajo")
            handleGesture("head_down")
        }
        return
    }

    // ARRIBA
    if(diff < -parameterGestureUp){
        if(verticalState !== "up"){
            verticalState = "up"
            headDown = false
            console.log("Cabeza arriba")
            handleGesture("head_up")
        }
        return
    }

    // NEUTRAL
    if(Math.abs(diff) < deadZone){
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
let eyeState = "open" // "open" | "closing"
let openFrames = 0

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y)
}

function getEAR(landmarks) {
    const p1 = landmarks[33]
    const p4 = landmarks[133]

    const p2 = landmarks[159]
    const p6 = landmarks[145]

    const p3 = landmarks[158]
    const p5 = landmarks[153]

    const vertical1 = distance(p2, p6)
    const vertical2 = distance(p3, p5)
    const horizontal = distance(p1, p4)

    return (vertical1 + vertical2) / (2.0 * horizontal)
}

function smoothEAR(ear) {
    earHistory.push(ear)
    if (earHistory.length > EAR_WINDOW) {
        earHistory.shift()
    }
    return earHistory.reduce((a, b) => a + b, 0) / earHistory.length
}

function updateBaseline(ear) {
    if (!baselineEAR) {
        baselineEAR = ear
        return
    }

    // Solo actualizar si claramente está abierto
    if (ear > baselineEAR * 0.9) {
        baselineEAR = 0.98 * baselineEAR + 0.02 * ear
    }
}

function isHeadTurned(landmarks) {
    const nose = landmarks[1]
    const leftFace = landmarks[234]
    const rightFace = landmarks[454]

    const distLeft = Math.abs(nose.x - leftFace.x)
    const distRight = Math.abs(nose.x - rightFace.x)

    const ratio = distLeft / distRight

    return (ratio < 0.5 || ratio > 2)
}

function detectBlink(landmarks){

    if(gestureCooldown) return
    if(isHeadTurned(landmarks)) return

    const earRaw = getEAR(landmarks)
    const ear = smoothEAR(earRaw)

    updateBaseline(ear)

    if(!baselineEAR) return

    const threshold = baselineEAR * 0.65

    // OJO ABIERTO
    if(ear > threshold){
        openFrames++

        if(eyeState !== "open"){
            eyeState = "open"
            blinkStart = null
        }

        return
    }

    // Evitar falsos si no estuvo abierto antes
    if(openFrames < 2){
        return
    }

    // OJO CERRANDO
    if(ear <= threshold){

        if(eyeState === "open"){
            eyeState = "closing"
            blinkStart = Date.now()
        }

        if(blinkStart){
            const duration = Date.now() - blinkStart

            if(duration > parameterGestureBlink){
                console.log("Parpadeo largo")
                handleGesture("long_blink")

                blinkStart = null
                eyeState = "open"
                openFrames = 0
            }
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