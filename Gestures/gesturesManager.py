from Stories.services import managerStories

async def gestures_manager(data, consumer):
    type = data.get("type", None)
    action = data.get("action", None)
    payload = data.get("payload", None)

    print(f"Received message: {type} - {action} - {payload}")

    if type == "story":
        await managerStories(action=action, payload=payload, consumer=consumer)


