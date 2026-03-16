// Coneccion WebSocket
const socket = new WebSocket("ws://" + window.location.host + "/ws/story/");

socket.onopen = function() {
    console.log("Conectado al servidor");};

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Mensaje del servidor:", data);};



// Activacion Camara
async function startCamera() {

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false});

        const video = document.getElementById("camera");
        video.srcObject = stream;

        console.log("Cámara activada");

        showStatus("camera-msg","Cámara activada","ok",2000);

        startFaceDetection(video);

    } catch (error) {
        console.error("No se pudo acceder a la cámara:", error);

        showStatus("camera-msg","No se pudo activar la cámara","error");}}


// ESTADOS DEL SISTEMA
let faceState = false
let blinkStart = null
let gestureCooldown = false

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
            socket.send(JSON.stringify({
                type: "face_detected",
                value: true }));}}
        else{

            if(faceState){

                faceState = false;
                console.log("No se detecta rostro");
                showStatus("face-msg","No se detecta rostro","error");
                socket.send(JSON.stringify({
                    type: "face_detected",
                    value: false }));}}});

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
        }
    })

    faceMesh.setOptions({
        maxNumFaces:1,
        refineLandmarks:true,
        minDetectionConfidence:0.6,
        minTrackingConfidence:0.6
    })


    faceMesh.onResults(results=>{

        // SOLO analizar gestos si hay rostro
        if(!faceState) return

        if(results.multiFaceLandmarks.length === 0) return

        const landmarks = results.multiFaceLandmarks[0]

        detectHeadTilt(landmarks)
        detectBlink(landmarks)

    })

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

    if(angle > 15){
        console.log("Cabeza izquierda")
        sendGesture("head_left")
    }

    if(angle < -15){
        console.log("Cabeza derecha")
        sendGesture("head_right")
    }

}

// DETECCION PARPADEO LARGO
function detectBlink(landmarks){

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
            blinkStart = Date.now()
        }

        const duration = Date.now() - blinkStart

        if(duration > 500){

            console.log("Parpadeo largo")
            sendGesture("long_blink")
            blinkStart = null
        }

    }else{
        blinkStart = null
    }
}

// ENVIO DE GESTOS + COOLDOWN
function sendGesture(type){

    gestureCooldown = true

    socket.send(JSON.stringify({
        type:"gesture",
        value:type
    }))

    setTimeout(()=>{
        gestureCooldown = false
    },1000)

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