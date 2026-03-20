
def gestures_manager(data):
    type = data.get("type", None)
    action = data.get("action", None)
    payload = data.get("payload", None)

    print(f"Received message: {type} - {action} - {payload}")


