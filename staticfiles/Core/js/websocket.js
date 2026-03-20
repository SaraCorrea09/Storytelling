// Coneccion WebSocket
const socket = new WebSocket("ws://" + window.location.host + "/ws/story/");

socket.onopen = function() {
    console.log("Conectado al servidor");};

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Mensaje del servidor:", data);

    if(data.type === "scene"){
        renderScene(data)
    }
};