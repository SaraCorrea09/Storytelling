from channels.generic.websocket import AsyncWebsocketConsumer
import json
from Gestures.gesturesManager import gestures_manager

class StoryConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        print("WebSocket conectado")

    async def receive(self, text_data):
        data = json.loads(text_data)
        gestures_manager(data)

    async def disconnect(self, close_code):
        print("WebSocket desconectado")