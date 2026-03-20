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
        showStatus("camera-msg","Micrófono activo","ok");
    };

    recognition.onresult = (event) => {

        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        console.log("Usuario dijo:", transcript);
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
            showStatus("face-msg","Rostro detectado","ok",2000);
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


// DETECCION INCLINACION CABEZA
function detectHeadTilt(landmarks){

    if(gestureCooldown) return

    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const dx = rightEye.x - leftEye.x
    const dy = rightEye.y - leftEye.y

    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    if(angle > parameterGestureLeft){
        console.log("Cabeza izquierda")
        handleGesture("head_left")
    }

    if(angle < parameterGestureRight){
        console.log("Cabeza derecha")
        handleGesture("head_right")
    }}

function detectHeadVertical(landmarks){

    if(gestureCooldown) return

    const nose = landmarks[1]
    const leftEye = landmarks[33]
    const rightEye = landmarks[263]

    const eyeCenterY = (leftEye.y + rightEye.y) / 2
    const diff = nose.y - eyeCenterY

    headDown = diff > parameterGestureDown

    if(headDown){

        console.log("Cabeza abajo")
        handleGesture("head_down")
    }

    if(diff < parameterGestureUp){

        console.log("Cabeza arriba")
        handleGesture("head_up")
    }

}

// DETECCION PARPADEO LARGO
function detectBlink(landmarks){

    if(headDown) return
    if(gestureCooldown) return

    const top = landmarks[159]
    const bottom = landmarks[145]
    const left = landmarks[33]
    const right = landmarks[133]
    const vertical = Math.abs(top.y - bottom.y)
    const horizontal = Math.abs(left.x - right.x)
    const ratio = vertical / horizontal
    const threshold = 0.18

    if(ratio < threshold){

        if(!blinkStart){
            blinkStart = Date.now()}

        const duration = Date.now() - blinkStart

        if(duration > parameterGestureBlink){
            console.log("Parpadeo largo")
            handleGesture("long_blink")
            blinkStart = null}

    }else{
        blinkStart = null
    }
}

// Status de la camara y deteccion de rostro
function showStatus(elementId, message, type, duration=0){

    const el = document.getElementById(elementId);
    el.className = "status-msg " + (type === "ok" ? "status-ok" : "status-error");
    el.innerText = message;

    if(duration > 0){
        setTimeout(()=>{
        el.innerText="";
        el.className="status-msg";
    }, duration);}}