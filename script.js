document.getElementById("salaryForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const experience = document.getElementById("experience").value;
    const jobTitle = document.getElementById("job_title").value;

    if (!experience || !jobTitle) {
        alert("Veuillez entrer une expérience et un titre de job valide.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                experience: parseInt(experience),
                job_title: jobTitle
            }),
        });

        const data = await response.json();
        if (data.predicted_salary) {
            document.getElementById("result").innerHTML = `<p><strong>${jobTitle}</strong> avec ${experience} années d'expérience : Le salaire prédit est <strong>${data.predicted_salary.toFixed(2)} €</strong></p>`;
        } else {
            document.getElementById("result").innerHTML = `<p>Erreur : ${data.error}</p>`;
        }
    } catch (error) {
        document.getElementById("result").innerHTML = `<p>Erreur lors de la connexion à l'API.</p>`;
    }
});
