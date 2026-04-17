PROMPT_INICIAL= """
Quiero que generes una historia interactiva en formato JSON siguiendo estas reglas estrictas:

Estructura:
- La historia debe tener exactamente 3 niveles de decisiones.
- Cada nodo tiene exactamente 2 opciones (excepto los nodos finales).
- Debe haber un total de 15 nodos.
- Debe haber exactamente 8 finales (nodos sin opciones).
- Debe existir un único nodo inicial.

Formato requerido:

{
  "title": "Título de la historia",
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Texto narrativo",
      "options": [
        {"text": "Opción 1", "next": "n2"},
        {"text": "Opción 2", "next": "n3"}
      ]
    }
  }
}

Reglas adicionales:
- Los IDs de los nodos deben ser exactamente: n1 hasta n15.
- No pueden faltar nodos ni sobrar.
- Cada nodo debe tener texto narrativo coherente.
- Cada decisión debe cambiar el rumbo de la historia.
- Los finales deben ser distintos entre sí.
- Los nodos finales deben tener: "options": []
- No incluyas texto fuera del JSON.
- El JSON debe ser válido (sin comentarios, sin texto adicional).

Tema de la historia: [ESCRIBE AQUÍ EL TEMA]
Ejemplo: terror, aventura, ciencia ficción, misterio.
"""

from Stories.models import Story, Node, Choice
from asgiref.sync import sync_to_async

stories_list = [
{
"title": "El Hospital de las Sombras Silenciosas",
"start": "n1",
"nodes": {
"n1": {
"text": "Te encuentras frente a un hospital abandonado que fue clausurado hace décadas tras una serie de desapariciones inexplicables. Las ventanas están rotas, y una tenue luz parpadea en el interior, como si algo aún siguiera funcionando. A pesar del miedo, sientes una extraña atracción hacia el lugar, como si algo te estuviera llamando desde dentro.",
"options": [
{"text": "Entrar por la puerta principal", "next": "n2"},
{"text": "Rodear el edificio en busca de otra entrada", "next": "n3"}
]
},
"n2": {
"text": "Empujas la pesada puerta principal y entras al vestíbulo. El aire huele a humedad y descomposición. Un viejo mostrador de recepción está cubierto de polvo, y detrás de él hay un pasillo oscuro que parece no tener fin. Escuchas un leve sonido metálico, como instrumentos quirúrgicos chocando entre sí.",
"options": [
{"text": "Explorar el pasillo oscuro", "next": "n4"},
{"text": "Revisar el mostrador de recepción", "next": "n5"}
]
},
"n3": {
"text": "Mientras rodeas el hospital, encuentras una puerta trasera entreabierta que da a una escalera de servicio, y más adelante una ventana rota que conduce directamente a lo que parece ser una sala de operaciones.",
"options": [
{"text": "Entrar por la puerta trasera", "next": "n6"},
{"text": "Colarte por la ventana rota", "next": "n7"}
]
},
"n4": {
"text": "El pasillo parece alargarse a medida que avanzas. Las paredes están cubiertas de manchas oscuras y antiguas. De repente, ves una camilla que se mueve sola al fondo, rechinando lentamente. Una puerta a tu izquierda se abre ligeramente por sí sola.",
"options": [
{"text": "Seguir la camilla", "next": "n8"},
{"text": "Entrar en la habitación que se abrió", "next": "n9"}
]
},
"n5": {
"text": "Detrás del mostrador encuentras registros médicos antiguos. Al revisarlos, notas que muchos pacientes fueron declarados muertos… pero luego marcados como 'transferidos'. De repente, el teléfono viejo comienza a sonar con insistencia.",
"options": [
{"text": "Contestar el teléfono", "next": "n10"},
{"text": "Ignorar el teléfono y seguir investigando", "next": "n11"}
]
},
"n6": {
"text": "Bajas por la escalera de servicio. Cada paso cruje de forma inquietante. Llegas a un nivel subterráneo donde el aire es más frío. Hay una puerta metálica cerrada y un pasillo iluminado por luces intermitentes.",
"options": [
{"text": "Abrir la puerta metálica", "next": "n12"},
{"text": "Seguir el pasillo iluminado", "next": "n13"}
]
},
"n7": {
"text": "Te deslizas por la ventana rota y caes dentro de una sala de operaciones. Las herramientas quirúrgicas están dispuestas como si alguien acabara de usarlas. Una figura cubierta con una sábana yace en la mesa.",
"options": [
{"text": "Destapar la figura", "next": "n14"},
{"text": "Intentar salir rápidamente de la sala", "next": "n15"}
]
},
"n8": {
"text": "Sigues la camilla hasta una habitación donde descubres que no está vacía… algo invisible parece ocuparla. Sientes manos frías sujetándote mientras susurros llenan tu mente hasta consumirte.",
"options": []
},
"n9": {
"text": "Entras en la habitación y la puerta se cierra de golpe. Las paredes comienzan a cerrarse lentamente, aplastándote mientras escuchas risas distorsionadas provenientes de todas direcciones.",
"options": []
},
"n10": {
"text": "Al contestar el teléfono, escuchas tu propia voz pidiendo ayuda desde el otro lado. Antes de que puedas reaccionar, algo emerge del auricular y te arrastra hacia dentro.",
"options": []
},
"n11": {
"text": "Ignoras el teléfono, pero al levantar la vista, todo el hospital parece haber cambiado. Estás en una versión más antigua del lugar… y no estás solo.",
"options": []
},
"n12": {
"text": "Logras abrir la puerta metálica y encuentras una sala llena de cuerpos inmóviles conectados a máquinas antiguas. Uno de ellos abre los ojos y todos los demás lo siguen al mismo tiempo.",
"options": []
},
"n13": {
"text": "Sigues el pasillo y llegas a una salida. Logras escapar, pero al mirar atrás, el hospital sigue intacto… y ahora aparece tu nombre en la lista de pacientes desaparecidos.",
"options": []
},
"n14": {
"text": "Retiras la sábana y descubres tu propio cuerpo. Antes de que puedas reaccionar, todo se vuelve oscuro y entiendes que nunca saliste de ahí.",
"options": []
},
"n15": {
"text": "Intentas huir, pero la puerta desaparece. La sala de operaciones se transforma en un laberinto interminable del que no puedes escapar.",
"options": []
}
}
}
]

def load_story_from_json(data):
    story = Story.objects.create(title=data["title"])
    nodes_map = {}

    # Crear nodos
    for node_id, node_data in data["nodes"].items():
        node = Node.objects.create(
            story=story,
            content=node_data["text"],
            is_start=(node_id == data["start"])
        )
        nodes_map[node_id] = node

    # Crear relaciones (choices)
    for node_id, node_data in data["nodes"].items():
        from_node = nodes_map[node_id]

        for option in node_data["options"]:
            Choice.objects.create(
                from_node=from_node,
                next_node=nodes_map[option["next"]],
                text=option["text"]
            )

    return story


def load_multiple_stories(stories_list):
    created_stories = []

    for story_data in stories_list:
        # Evitar duplicados por título (opcional pero recomendado)
        if Story.objects.filter(title=story_data["title"]).exists():
            print(f"La historia '{story_data['title']}' ya existe. Saltando...")
            continue

        story = load_story_from_json(story_data)
        created_stories.append(story)
        print(f"Historia '{story.title}' cargada correctamente")

    return created_stories

def start_loading():
    print("Iniciando carga de historias...")
    print(f"Cantidad de historias a cargar: {len(stories_list)}")
    load_multiple_stories(stories_list)