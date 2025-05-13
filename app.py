import pandas as pd
import sqlite3
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import pickle
from flask import Flask, request, render_template

# --- Chargement et nettoyage des données ---
df = pd.read_csv("data/raw_salaries.csv")  # Ton fichier CSV brut
df.dropna(inplace=True)
df['experience'] = df['experience'].astype(str).str.extract(r'(\\d+)').astype(float)

# --- Encodage du métier (LabelEncoder) ---
le = LabelEncoder()
df['job_title'] = le.fit_transform(df['job_title'])

# --- Entraînement du modèle de régression ---
X = df[['job_title', 'experience']]
y = df['salary']
model = LinearRegression()
model.fit(X, y)

# --- Sauvegarde du modèle et de l’encodeur ---
with open("model.pkl", "wb") as f:
    pickle.dump((model, le), f)

# --- Sauvegarde dans une base SQLite ---
conn = sqlite3.connect("salaries.db")
df.to_sql("salaries", conn, if_exists="replace", index=False)

# --- Initialisation de l’application Flask ---
app = Flask(__name__)
model, le = pickle.load(open("model.pkl", "rb"))  # Rechargement du modèle

# --- Page d’accueil avec prédiction ---
@app.route("/", methods=["GET", "POST"])
def home():
    salary = None
    if request.method == "POST":
        job = request.form["job"]
        exp = int(request.form["experience"])
        job_encoded = le.transform([job])[0]
        salary = model.predict([[job_encoded, exp]])[0]
    return render_template("index.html", salary=round(salary, 2) if salary else None)

# --- Lancement du serveur ---
if __name__ == "__main__":
    app.run(debug=True)
