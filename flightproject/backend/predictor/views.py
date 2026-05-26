from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import joblib
import os
import numpy as np
import requests
import random
from django.core.cache import cache

# ==============================
# Load ML model and encoders
# ==============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml_model", "model.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "ml_model", "encoders.pkl")

try:
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)
except Exception as e:
    print("Warning: Could not load model or encoders:", e)
    model = None
    encoders = {}

def safe_encode(encoder, val, default=0):
    try:
        return encoder.transform([val])[0]
    except ValueError:
        # If unseen label, just use a default fallback (e.g. 0)
        return default

@csrf_exempt
def predict_delay(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            airline = data.get("airline", "")
            source = data.get("source", "")
            destination = data.get("destination", "")
            duration = int(data.get("duration", 0))

            if model and encoders:
                airline_enc = safe_encode(encoders.get("airline"), airline)
                source_enc = safe_encode(encoders.get("origin"), source)
                destination_enc = safe_encode(encoders.get("dest"), destination)
                
                input_data = np.array([
                    [airline_enc, source_enc, destination_enc, duration]
                ])

                prediction = model.predict(input_data)[0]
                probability = model.predict_proba(input_data)[0].max()
            else:
                # Fallback if no model loaded
                prediction = 1 if random.random() > 0.5 else 0
                probability = random.uniform(0.5, 0.99)

            return JsonResponse({
                "delay": bool(prediction),
                "confidence": round(float(probability), 2)
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST allowed"}, status=400)


@csrf_exempt
def live_flights(request):
    """
    Fetches real-time flight data from OpenSky Network API.
    Returns simulated predictions using our ML model.
    """
    if request.method == "GET":
        try:
            # Check if we have cached data to avoid rate limits
            cached_flights = cache.get("live_flights_data")
            if cached_flights:
                return JsonResponse({"flights": cached_flights})

            # We fetch a bounding box of live flights to keep the response fast and manageable.
            # Bounding box over India: lamin=8.0, lomin=68.0, lamax=37.0, lomax=97.0
            url = "https://opensky-network.org/api/states/all?lamin=8.0&lomin=68.0&lamax=37.0&lomax=97.0"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                states = data.get("states", [])
                
                flights = []
                # Take top 100 active flights to populate map better
                for state in states[:100]:
                    callsign = str(state[1]).strip() if state[1] else "UNKNOWN"
                    origin_country = state[2]
                    longitude = state[5]
                    latitude = state[6]
                    altitude = state[7] # m
                    on_ground = state[8]
                    velocity = state[9] # m/s
                    true_track = state[10] # heading
                    
                    if not callsign or callsign == "UNKNOWN" or not longitude or not latitude:
                        continue
                        
                    # Extract a mock airline from callsign (e.g. IGO123 -> IGO)
                    airline_mock = callsign[:3]
                    
                    # Generate a prediction for this live flight
                    prob = 0.5
                    pred_delay = False
                    
                    if model and encoders:
                        # For live flights without exact route, we mock origin/dest or use default
                        air_enc = safe_encode(encoders.get("airline"), airline_mock)
                        src_enc = 0 # Defaulting for live demo
                        dst_enc = 1 # Defaulting for live demo
                        dur = int(velocity * 0.5) if velocity else 100
                        
                        input_data = np.array([[air_enc, src_enc, dst_enc, dur]])
                        pred_delay = bool(model.predict(input_data)[0])
                        prob = float(model.predict_proba(input_data)[0].max())
                    else:
                        pred_delay = random.random() > 0.8
                        prob = random.uniform(0.5, 0.99)
                        
                    flights.append({
                        "callsign": callsign,
                        "country": origin_country,
                        "longitude": longitude,
                        "latitude": latitude,
                        "heading": true_track or 0,
                        "on_ground": on_ground,
                        "velocity": round(velocity * 3.6, 1) if velocity else 0, # km/h
                        "altitude": altitude,
                        "delay": pred_delay,
                        "confidence": round(prob, 2)
                    })
                    
                # Cache the results for 15 seconds
                cache.set("live_flights_data", flights, 15)
                return JsonResponse({"flights": flights})
            else:
                # If rate limited, return empty or fallback
                # Generate realistic Indian fallback flights
                fallback_routes = [
                    {"callsign": "IGO101", "country": "India", "longitude": 74.9, "latitude": 23.8, "heading": 210, "velocity": 230 * 3.6, "altitude": 10200},
                    {"callsign": "AIC242", "country": "India", "longitude": 75.3, "latitude": 16.1, "heading": 150, "velocity": 240 * 3.6, "altitude": 10500},
                    {"callsign": "VTI852", "country": "India", "longitude": 82.7, "latitude": 25.6, "heading": 110, "velocity": 225 * 3.6, "altitude": 10800},
                    {"callsign": "SEJ963", "country": "India", "longitude": 78.6, "latitude": 20.7, "heading": 350, "velocity": 235 * 3.6, "altitude": 9900},
                    {"callsign": "LLR104", "country": "India", "longitude": 78.1, "latitude": 15.2, "heading": 10, "velocity": 210 * 3.6, "altitude": 9500},
                    {"callsign": "AKJ542", "country": "India", "longitude": 80.6, "latitude": 20.9, "heading": 245, "velocity": 220 * 3.6, "altitude": 10100},
                    {"callsign": "IGO305", "country": "India", "longitude": 77.8, "latitude": 22.9, "heading": 355, "velocity": 230 * 3.6, "altitude": 10400},
                    {"callsign": "AIC412", "country": "India", "longitude": 75.2, "latitude": 24.1, "heading": 30, "velocity": 240 * 3.6, "altitude": 10700},
                    {"callsign": "VTI108", "country": "India", "longitude": 77.4, "latitude": 20.8, "heading": 185, "velocity": 235 * 3.6, "altitude": 10300},
                    {"callsign": "SEJ209", "country": "India", "longitude": 77.5, "latitude": 21.2, "heading": 5, "velocity": 230 * 3.6, "altitude": 10000}
                ]
                flights = []
                for f in fallback_routes:
                    airline_mock = f["callsign"][:3]
                    prob = 0.5
                    pred_delay = False
                    
                    if model and encoders:
                        air_enc = safe_encode(encoders.get("airline"), airline_mock)
                        src_enc = 0
                        dst_enc = 1
                        dur = int(f["velocity"] * 0.15)
                        
                        input_data = np.array([[air_enc, src_enc, dst_enc, dur]])
                        pred_delay = bool(model.predict(input_data)[0])
                        prob = float(model.predict_proba(input_data)[0].max())
                    else:
                        pred_delay = random.random() > 0.8
                        prob = random.uniform(0.5, 0.99)
                        
                    flights.append({
                        "callsign": f["callsign"],
                        "country": f["country"],
                        "longitude": f["longitude"],
                        "latitude": f["latitude"],
                        "heading": f["heading"],
                        "on_ground": False,
                        "velocity": round(f["velocity"], 1),
                        "altitude": f["altitude"],
                        "delay": pred_delay,
                        "confidence": round(prob, 2)
                    })
                cache.set("live_flights_data", flights, 15)
                return JsonResponse({"flights": flights})
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only GET allowed"}, status=400)

@csrf_exempt
def flight_intel(request, callsign):
    """
    Returns simulated historical telemetry data for a specific flight.
    This simulates altitude and velocity changes over the past 2 hours.
    """
    if request.method == "GET":
        try:
            # Generate 20 data points spanning the last 120 minutes
            import datetime
            now = datetime.datetime.now()
            telemetry = []
            
            # Base values to simulate realistic variations
            base_alt = random.randint(8000, 11000) # cruising altitude in meters
            base_vel = random.randint(700, 900)    # cruising speed in km/h
            
            for i in range(20):
                time_point = now - datetime.timedelta(minutes=(20-i)*6)
                
                # Add some noise to the data
                alt_noise = random.randint(-200, 200)
                vel_noise = random.randint(-15, 15)
                
                # Simulate takeoff climb and landing descent for early/late points
                if i < 3:
                    current_alt = base_alt * (i+1)/3 + alt_noise
                    current_vel = base_vel * (i+1)/3 + vel_noise
                else:
                    current_alt = base_alt + alt_noise
                    current_vel = base_vel + vel_noise
                
                telemetry.append({
                    "time": time_point.strftime("%H:%M"),
                    "altitude": max(0, round(current_alt)),
                    "velocity": max(0, round(current_vel))
                })
                
            # Simulate detailed breakdown
            reasons = ["Air traffic congestion", "Weather anomalies", "Aircraft maintenance", "Late arrival of previous flight", "Security procedures"]
            top_reason = random.choice(reasons)
            
            return JsonResponse({
                "callsign": callsign,
                "telemetry": telemetry,
                "predicted_eta_minutes": random.randint(30, 240),
                "delay_reason": top_reason,
                "risk_factor": round(random.uniform(0.1, 0.9), 2)
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only GET allowed"}, status=400)
