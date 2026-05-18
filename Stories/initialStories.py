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
},
{
  "title": "La Aventura del Valle Perdido",
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Te encuentras frente a la entrada de un antiguo valle escondido entre montañas. Una leyenda dice que allí hay un tesoro olvidado.",
      "options": [
        {"text": "Entrar por el sendero del bosque", "next": "n2"},
        {"text": "Subir por el camino rocoso", "next": "n3"}
      ]
    },
    "n2": {
      "text": "El bosque es oscuro y silencioso. Encuentras un río que divide el camino.",
      "options": [
        {"text": "Cruzar el puente de madera", "next": "n4"},
        {"text": "Seguir el río corriente arriba", "next": "n5"}
      ]
    },
    "n3": {
      "text": "El camino rocoso te lleva a un acantilado con dos rutas posibles.",
      "options": [
        {"text": "Entrar en una cueva iluminada", "next": "n6"},
        {"text": "Escalar hacia la cima", "next": "n7"}
      ]
    },
    "n4": {
      "text": "Cruzas el puente y descubres unas ruinas cubiertas de musgo.",
      "options": [
        {"text": "Explorar el templo central", "next": "n8"},
        {"text": "Buscar en las habitaciones laterales", "next": "n9"}
      ]
    },
    "n5": {
      "text": "Siguiendo el río encuentras una cascada detrás de la cual parece haber algo oculto.",
      "options": [
        {"text": "Entrar detrás de la cascada", "next": "n10"},
        {"text": "Descansar junto al río", "next": "n11"}
      ]
    },
    "n6": {
      "text": "Dentro de la cueva hay inscripciones antiguas y dos túneles.",
      "options": [
        {"text": "Tomar el túnel izquierdo", "next": "n12"},
        {"text": "Tomar el túnel derecho", "next": "n13"}
      ]
    },
    "n7": {
      "text": "Llegas cerca de la cima y encuentras una torre abandonada.",
      "options": [
        {"text": "Entrar a la torre", "next": "n14"},
        {"text": "Continuar hasta la cima", "next": "n15"}
      ]
    },
    "n8": {
      "text": "Encuentras un altar dorado con el tesoro legendario. Regresas convertido en héroe.",
      "options": []
    },
    "n9": {
      "text": "Descubres una biblioteca secreta llena de mapas antiguos y conocimiento perdido.",
      "options": []
    },
    "n10": {
      "text": "Detrás de la cascada hallas una cámara oculta con cristales brillantes.",
      "options": []
    },
    "n11": {
      "text": "Mientras descansas, una tribu amistosa te encuentra y te invita a su aldea.",
      "options": []
    },
    "n12": {
      "text": "El túnel izquierdo conduce a una salida secreta hacia un valle lleno de animales raros.",
      "options": []
    },
    "n13": {
      "text": "El túnel derecho te lleva a una sala donde activas accidentalmente un mecanismo y quedas atrapado.",
      "options": []
    },
    "n14": {
      "text": "Dentro de la torre encuentras un telescopio mágico capaz de revelar tierras desconocidas.",
      "options": []
    },
    "n15": {
      "text": "Al alcanzar la cima contemplas un amanecer espectacular y descubres que el verdadero tesoro era el viaje.",
      "options": []
    }
  }
},
{
  "title": "La Última Señal de Orión",
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Año 2487. Eres piloto de una nave exploradora y recibes una señal desconocida proveniente del sistema Orión.",
      "options": [
        {
          "text": "Seguir la señal hacia una estación abandonada",
          "next": "n2"
        },
        {
          "text": "Rastrear el origen en un planeta cercano",
          "next": "n3"
        }
      ]
    },
    "n2": {
      "text": "La estación parece desierta, pero sus sistemas aún funcionan parcialmente.",
      "options": [
        {
          "text": "Acceder al núcleo de energía",
          "next": "n4"
        },
        {
          "text": "Explorar el laboratorio principal",
          "next": "n5"
        }
      ]
    },
    "n3": {
      "text": "Aterrizas en un planeta cubierto por tormentas eléctricas y ruinas metálicas.",
      "options": [
        {
          "text": "Investigar una torre de transmisión",
          "next": "n6"
        },
        {
          "text": "Entrar en una ciudad subterránea",
          "next": "n7"
        }
      ]
    },
    "n4": {
      "text": "En el núcleo descubres una inteligencia artificial antigua conectada a toda la estación.",
      "options": [
        {
          "text": "Reiniciar la inteligencia artificial",
          "next": "n8"
        },
        {
          "text": "Desconectar el sistema y extraer datos",
          "next": "n9"
        }
      ]
    },
    "n5": {
      "text": "El laboratorio contiene cápsulas criogénicas con tripulantes en suspensión.",
      "options": [
        {
          "text": "Despertar a un científico",
          "next": "n10"
        },
        {
          "text": "Analizar registros genéticos",
          "next": "n11"
        }
      ]
    },
    "n6": {
      "text": "La torre emite una señal pulsante dirigida hacia el espacio profundo.",
      "options": [
        {
          "text": "Amplificar la señal",
          "next": "n12"
        },
        {
          "text": "Apagar la transmisión",
          "next": "n13"
        }
      ]
    },
    "n7": {
      "text": "En la ciudad subterránea encuentras tecnología alienígena intacta.",
      "options": [
        {
          "text": "Activar un portal desconocido",
          "next": "n14"
        },
        {
          "text": "Recuperar un artefacto brillante",
          "next": "n15"
        }
      ]
    },
    "n8": {
      "text": "La inteligencia artificial despierta y te nombra guardián de la estación, entregándote conocimiento prohibido.",
      "options": []
    },
    "n9": {
      "text": "Extraes información valiosa y escapas antes de que la estación colapse.",
      "options": []
    },
    "n10": {
      "text": "El científico despierta y revela la ubicación de una nueva colonia humana.",
      "options": []
    },
    "n11": {
      "text": "Descubres que los tripulantes fueron modificados genéticamente para sobrevivir en otros mundos.",
      "options": []
    },
    "n12": {
      "text": "La señal llega a una flota desconocida que responde con un mensaje amistoso.",
      "options": []
    },
    "n13": {
      "text": "Al apagar la torre, las tormentas cesan y el planeta revela una superficie habitable.",
      "options": []
    },
    "n14": {
      "text": "El portal se activa y te transporta a una galaxia inexplorada.",
      "options": []
    },
    "n15": {
      "text": "El artefacto resulta ser una fuente de energía infinita que cambia el destino de la humanidad.",
      "options": []
    }
  }
},
{
  "title": "El Secreto de la Mansión Hollow",
  "start": "n1",
  "nodes": {
    "n1": {
      "text": "Recibes una carta anónima invitándote a una antigua mansión donde, según el remitente, se esconde un secreto familiar olvidado.",
      "options": [
        {
          "text": "Entrar por la puerta principal",
          "next": "n2"
        },
        {
          "text": "Rodear la mansión y buscar otra entrada",
          "next": "n3"
        }
      ]
    },
    "n2": {
      "text": "El vestíbulo está cubierto de polvo y retratos antiguos observan cada uno de tus movimientos.",
      "options": [
        {
          "text": "Subir por la gran escalera",
          "next": "n4"
        },
        {
          "text": "Entrar en la biblioteca",
          "next": "n5"
        }
      ]
    },
    "n3": {
      "text": "Detrás de la mansión encuentras un jardín descuidado y una puerta lateral entreabierta.",
      "options": [
        {
          "text": "Bajar al sótano por una trampilla",
          "next": "n6"
        },
        {
          "text": "Entrar al invernadero abandonado",
          "next": "n7"
        }
      ]
    },
    "n4": {
      "text": "En el segundo piso descubres un pasillo con varias habitaciones cerradas y una luz encendida al final.",
      "options": [
        {
          "text": "Abrir la habitación iluminada",
          "next": "n8"
        },
        {
          "text": "Investigar una puerta con llave antigua",
          "next": "n9"
        }
      ]
    },
    "n5": {
      "text": "La biblioteca contiene libros desordenados y un escritorio con documentos ocultos.",
      "options": [
        {
          "text": "Leer el diario encontrado",
          "next": "n10"
        },
        {
          "text": "Mover un libro sospechoso del estante",
          "next": "n11"
        }
      ]
    },
    "n6": {
      "text": "El sótano está húmedo y lleno de cajas viejas, pero escuchas un ruido metálico cercano.",
      "options": [
        {
          "text": "Seguir el sonido",
          "next": "n12"
        },
        {
          "text": "Abrir un cofre oxidado",
          "next": "n13"
        }
      ]
    },
    "n7": {
      "text": "El invernadero tiene plantas marchitas y una estatua con símbolos extraños grabados.",
      "options": [
        {
          "text": "Examinar la estatua",
          "next": "n14"
        },
        {
          "text": "Buscar entre las macetas rotas",
          "next": "n15"
        }
      ]
    },
    "n8": {
      "text": "Encuentras a un anciano que confiesa haber enviado la carta y te entrega un legado familiar perdido.",
      "options": []
    },
    "n9": {
      "text": "La puerta conduce a una habitación secreta con joyas escondidas durante generaciones.",
      "options": []
    },
    "n10": {
      "text": "El diario revela una antigua traición dentro de tu familia y cambia tu visión del pasado.",
      "options": []
    },
    "n11": {
      "text": "El libro activa un mecanismo y descubres un pasadizo oculto hacia una bóveda subterránea.",
      "options": []
    },
    "n12": {
      "text": "Siguiendo el sonido encuentras una máquina antigua que aún funciona y protege documentos confidenciales.",
      "options": []
    },
    "n13": {
      "text": "Dentro del cofre hallas cartas selladas que resuelven un misterio sin resolver durante décadas.",
      "options": []
    },
    "n14": {
      "text": "La estatua gira y revela una llave dorada capaz de abrir una cámara oculta en la mansión.",
      "options": []
    },
    "n15": {
      "text": "Entre las macetas encuentras una pequeña caja musical que contiene la última pista del enigma.",
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