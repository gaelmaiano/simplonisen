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

// Le reste de votre code pour le graphique
async function initChart() {
    try {
        const response = await fetch("http://127.0.0.1:5000/get_data");
        const data = await response.json();
        
        if (data.error) {
            console.error(data.error);
            return;
        }

        const ctx = document.getElementById('salaryChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Salaire vs Expérience',
                    data: data.experience.map((exp, index) => ({
                        x: exp,
                        y: data.salary[index],
                        jobTitle: data.job_titles[index]
                    })),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Années d\'expérience'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Salaire (€)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return [
                                    `Job: ${context.raw.jobTitle}`,
                                    `Expérience: ${context.raw.x} ans`,
                                    `Salaire: ${context.raw.y} €`
                                ];
                            }
                        }
                    }
                }
            }
        });

        addRegressionLine(chart, data.experience, data.salary);
    } catch (error) {
        console.error("Erreur lors du chargement du graphique:", error);
    }
}

function addRegressionLine(chart, xValues, yValues) {
    const n = xValues.length;
    const xSum = xValues.reduce((a, b) => a + b, 0);
    const ySum = yValues.reduce((a, b) => a + b, 0);
    const xySum = xValues.reduce((a, _, i) => a + xValues[i] * yValues[i], 0);
    const xxSum = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    const regressionLine = {
        type: 'line',
        label: 'Ligne de régression',
        data: [{
            x: Math.min(...xValues),
            y: slope * Math.min(...xValues) + intercept
        }, {
            x: Math.max(...xValues),
            y: slope * Math.max(...xValues) + intercept
        }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
    };
    
    chart.data.datasets.push(regressionLine);
    chart.update();
}

document.addEventListener('DOMContentLoaded', initChart);
