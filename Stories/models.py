from django.db import models

class Story(models.Model):
    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title
    
class Node(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    content = models.TextField()
    is_start = models.BooleanField(default=False)

    def __str__(self):
        return f"Node {self.id} of Story '{self.story.title}'"
    
class Choice(models.Model):
    from_node = models.ForeignKey(Node, related_name="options", on_delete=models.CASCADE)
    next_node = models.ForeignKey(Node, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)

    def __str__(self):
        return f"Choice '{self.text}' from Node {self.from_node.id} to Node {self.next_node.id}"