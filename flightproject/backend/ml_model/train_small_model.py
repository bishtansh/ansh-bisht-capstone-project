import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# ===== PATHS =====
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "flights.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ===== LOAD SMALL DATASET =====
df = pd.read_csv("ml_model/flights.csv", low_memory=False)


# Keep only useful columns
df = df[[
    "AIRLINE",
    "ORIGIN_AIRPORT",
    "DESTINATION_AIRPORT",
    "SCHEDULED_TIME",
    "DEPARTURE_DELAY"
]]

# Create target: 1 = delayed, 0 = not delayed
df["DELAYED"] = df["DEPARTURE_DELAY"].apply(lambda x: 1 if x > 15 else 0)

df.dropna(inplace=True)

# Encode categorical columns
le_airline = LabelEncoder()
le_origin = LabelEncoder()
le_dest = LabelEncoder()

df["AIRLINE"] = le_airline.fit_transform(df["AIRLINE"])
df["ORIGIN_AIRPORT"] = le_origin.fit_transform(df["ORIGIN_AIRPORT"])
df["DESTINATION_AIRPORT"] = le_dest.fit_transform(df["DESTINATION_AIRPORT"])

X = df[["AIRLINE", "ORIGIN_AIRPORT", "DESTINATION_AIRPORT", "SCHEDULED_TIME"]]
y = df["DELAYED"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train small model
model = RandomForestClassifier(
    n_estimators=50,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)

# Accuracy
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

# Save model and encoders
joblib.dump(model, MODEL_PATH)

ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.pkl")
encoders = {
    "airline": le_airline,
    "origin": le_origin,
    "dest": le_dest
}
joblib.dump(encoders, ENCODERS_PATH)

print("✅ Model and encoders trained successfully")
print("🎯 Accuracy:", round(accuracy, 2))
print("💾 Model saved at:", MODEL_PATH)
print("💾 Encoders saved at:", ENCODERS_PATH)
