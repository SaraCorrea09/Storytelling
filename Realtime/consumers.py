from channels.generic.websocket import AsyncWebsocketConsumer
import json

class StoryConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        print("WebSocket conectado")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Mensaje recibido:", data)

        # Respuesta al frontend
        await self.send(text_data=json.dumps({
            "message": "Servidor recibió tu mensaje",
            "data": data
        }))

    async def disconnect(self, close_code):
        print("WebSocket desconectado")