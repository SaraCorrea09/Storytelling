from asgiref.sync import sync_to_async

async def managerStories(action, payload, consumer):

    if action == "list":
        data = await listStories()
        await consumer.send_data("story", "list", data)

    elif action == "get":
        data = await getStory(payload)
        await consumer.send_data("story", "view", data)

    elif action == "random":
        data = await getStory()
        await consumer.send_data("story", "view", data)

    elif action == "create":
        await createStories()

@sync_to_async
def getStory(story_id=None):
    from Stories.models import Story, Node, Choice
    import random

    #  1. Obtener historia
    if story_id:
        story = Story.objects.filter(id=story_id).first()
    else:
        stories = list(Story.objects.all())
        if not stories:
            return None
        story = random.choice(stories)

    if not story:
        return None

    #  2. Obtener nodos
    nodes = Node.objects.filter(story=story)

    #  3. Mapear IDs → n1, n2, n3...
    node_map = {}
    id_to_key = {}

    for index, node in enumerate(nodes, start=1):
        key = f"n{index}"
        node_map[key] = node
        id_to_key[node.id] = key

    #  4. Construir JSON de nodos
    nodes_json = {}
    start_node_key = None

    for key, node in node_map.items():
        # encontrar nodo inicial
        if node.is_start:
            start_node_key = key

        # opciones (choices)
        choices = Choice.objects.filter(from_node=node)

        options = []
        for choice in choices:
            options.append({
                "text": choice.text,
                "next": id_to_key.get(choice.next_node.id)
            })

        nodes_json[key] = {
            "text": node.content,
            "options": options
        }

    #  5. Armar JSON final
    result = {
        "title": story.title,
        "start": start_node_key,
        "nodes": nodes_json
    }

    return result

@sync_to_async
def listStories():
    pass

@sync_to_async
def createStories():
    from .initialStories import start_loading
    start_loading()
