from flask import Flask, request, jsonify
import pandas as pd
from sklearn.linear_model import LinearRegression

# Charger les données
data = pd.read_csv("raw_salaries.csv")

# Affichage pour vérifier
print(data.head())

# Préparer les données
X = data[["experience"]]  # Colonne explicative correcte
y = data["salary"]        # Colonne cible

# Créer et entraîner le modèle
model = LinearRegression()
model.fit(X, y)

# Créer l'application Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "API de prédiction de salaire par expérience"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        experience = data["experience"]
        prediction = model.predict([[experience]])
        return jsonify({"predicted_salary": prediction[0]})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
