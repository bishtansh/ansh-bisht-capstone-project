from django.urls import path
from .views import predict_delay, live_flights, flight_intel

urlpatterns = [
    path("predict/", predict_delay, name="predict_delay"),
    path("live-flights/", live_flights, name="live_flights"),
    path("flight-intel/<str:callsign>/", flight_intel, name="flight_intel"),
]
