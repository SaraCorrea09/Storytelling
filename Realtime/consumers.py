from channels.generic.websocket import AsyncWebsocketConsumer
import json
from Gestures.gesturesManager import gestures_manager

class StoryConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        print("WebSocket conectado")

    async def receive(self, text_data):
        data = json.loads(text_data)
        await gestures_manager(data, self)

    async def send_data(self, type, action, payload=None):
        data = {
            "type": type,
            "action": action,
            "payload": payload
        }
        await self.send(text_data=json.dumps(data))

    async def disconnect(self, close_code):
        print("WebSocket desconectado")