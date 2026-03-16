
def gestures_manager(data):
    gesto = data["type"]
    valor = data["value"]

    if gesto == "face_detected":
        if valor:
            print("Se detectó un rostro en el frontend")
            # Aqui mandar al inicio de sesion 
        else:
            print("No se detecta rostro en el frontend")

    elif gesto == "gesture":
        if valor == "head_right":
            print("Gesto de cabeza hacia la derecha detectado en el frontend")
        elif valor == "head_left":
            print("Gesto de cabeza hacia la izquierda detectado en el frontend")    
        elif valor == "long_blink":
            print("Parpadeo largo detectado en el frontend")
