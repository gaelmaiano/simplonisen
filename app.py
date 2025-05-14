from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import pandas as pd
from sklearn.linear_model import LinearRegression

# Charger les données
data = pd.read_csv("raw_salaries.csv")

# Préparer les données
X = data[["experience"]]  # Colonne explicative correcte
y = data["salary"]        # Colonne cible

# Créer et entraîner le modèle
model = LinearRegression()
model.fit(X, y)

# Créer l'application Flask
app = Flask(__name__)

# Route pour la page principale (accueil)
@app.route("/")
def home():
    return send_from_directory(os.getcwd(), "index.html")

# Route pour servir les fichiers CSS et JS (static)
@app.route("/<path:path>")
def send_static(path):
    if path.endswith(".css"):
        return send_from_directory(os.getcwd(), path)
    if path.endswith(".js"):
        return send_from_directory(os.getcwd(), path)
    return send_from_directory(os.getcwd(), path)

# Route pour la prédiction du salaire
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        experience = data["experience"]
        job_title = data["job_title"]
        prediction = model.predict([[experience]])
        return jsonify({
            "predicted_salary": prediction[0],
            "job_title": job_title
        })
    except Exception as e:
        return jsonify({"error": str(e)})

# Route pour obtenir les données du graphique
@app.route("/get_data")
def get_data():
    try:
        # Convertir les données en format adapté pour Chart.js
        data_dict = {
            "experience": data["experience"].tolist(),
            "salary": data["salary"].tolist(),
            "job_titles": data["job_title"].tolist()
        }
        return jsonify(data_dict)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
