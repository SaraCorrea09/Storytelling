// Coneccion WebSocket
const socket = new WebSocket("ws://" + window.location.host + "/ws/story/");

    socket.onopen = function() {
        console.log("Conectado al servidor");
    };

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log("Mensaje del servidor:", data);
    };

    function sendMessage() {
        socket.send(JSON.stringify({
            type: "test",
            value: "Hola desde el navegador"
        }));
    }

// Activacion Camara
async function startCamera() {
    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        const video = document.getElementById("camera");
        video.srcObject = stream;

        console.log("Cámara activada");

    } catch (error) {

        console.error("No se pudo acceder a la cámara:", error);

    }
}

window.addEventListener("load", startCamera);
