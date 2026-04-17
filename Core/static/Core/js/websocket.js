let socketReady = false;

// Coneccion WebSocket
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const socket = new WebSocket(protocol + window.location.host + "/ws/story/");

socket.onopen = function() {
    console.log("Conectado al servidor");
    socketReady = true;
    sendMessage("story", "create");
};

socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Mensaje del servidor:", data);
    managerAnswer(data)
};

function sendMessage(type, action, message = null){

    if (!socketReady || socket.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket no listo aún");
        return;
    }

    socket.send(JSON.stringify({
                        type: type,
                        action: action,
                        payload: message
                    }))
    
    console.log("Mensaje enviado al servidor:", {type, action, payload: message});
}

socket.onerror = function(e) {
    console.error("Error en WebSocket:", e);
};

socket.onclose = function(e) {
    console.warn("WebSocket cerrado:", e);
};