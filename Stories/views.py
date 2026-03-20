from django.shortcuts import render

def story(request):
    return render(request, 'Stories/story.html')
