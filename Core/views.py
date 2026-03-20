from django.shortcuts import render, redirect


def redierccionar(request):
    return redirect('Core:home')

def home(request):
    return render(request, 'Core/home.html')
