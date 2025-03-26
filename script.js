const form = document.getElementById('bmi-form');
const heightFeetInput = document.getElementById('heightFeet');
const heightInchesInput = document.getElementById('heightInches');
const weightInput = document.getElementById('weight');
const bmiValue = document.getElementById('bmiValue');
const categoryLabel = document.getElementById('categoryLabel');
const mealPlan = document.getElementById('mealPlan');
const workoutPlan = document.getElementById('workoutPlan');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const bmiChart = document.getElementById('bmiChart').getContext('2d');

let bmiChartInstance = null;

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const heightFeet = parseFloat(heightFeetInput.value);
  const heightInches = parseFloat(heightInchesInput.value);
  const weight = parseFloat(weightInput.value);

  if (isValidInput(heightFeet, heightInches, weight)) {
    const bmi = calculateBMI(heightFeet, heightInches, weight);
    const category = getBMICategory(bmi);
    updateBMIUI(bmi, category);
    fetchMealAndWorkout(category);
    updateChart(category);
  } else {
    alert('Please enter valid numeric values for height and weight.');
  }
});

function isValidInput(heightFeet, heightInches, weight) {
  return !isNaN(heightFeet) && !isNaN(heightInches) && !isNaN(weight) && heightFeet > 0 && weight > 0;
}

function calculateBMI(heightFeet, heightInches, weight) {
  const heightInInches = heightFeet * 12 + heightInches;
  return ((weight / (heightInInches * heightInInches)) * 703).toFixed(2);
}

function getBMICategory(bmi) {
  const categories = [
    { max: 18.5, label: 'Underweight' },
    { max: 24.9, label: 'Normal weight' },
    { max: 29.9, label: 'Overweight' },
    { max: 34.9, label: 'Obesity (Class 1)' },
    { max: 39.9, label: 'Obesity (Class 2)' },
    { max: Infinity, label: 'Obesity (Class 3)' }
  ];

  for (let category of categories) {
    if (bmi < category.max) return category.label;
  }
  return 'Invalid BMI';
}

function updateBMIUI(bmi, category) {
  bmiValue.textContent = `Your BMI: ${bmi}`;
  categoryLabel.textContent = `Category: ${category}`;
}

async function fetchMealAndWorkout(category) {
  const categoryMealMap = {
    'Underweight': { meal: 'protein', workout: 'strength' },
    'Normal weight': { meal: 'protein', workout: 'strength' },
    'Overweight': { meal: 'lowcal', workout: 'weightloss' },
    'Obesity (Class 1)': { meal: 'lowcal', workout: 'weightloss' },
    'Obesity (Class 2)': { meal: 'lowcal', workout: 'weightloss' },
    'Obesity (Class 3)': { meal: 'lowcal', workout: 'weightloss' }
  };

  const { meal: mealGoal, workout: workoutType } = categoryMealMap[category];

  loadingMessage.textContent = 'Loading meal and workout data...';
  try {
    // Fetch meal data from the new API
    const mealResponse = await fetch("https://full-strength-academy.onrender.com/api/meals");
    if (!mealResponse.ok) throw new Error("Failed to fetch meals");
    const mealData = await mealResponse.json();
    const filteredMeals = mealData.filter(item => item.focus_goal === mealGoal);
    const randomMeal = filteredMeals.length > 0 ? filteredMeals[Math.floor(Math.random() * filteredMeals.length)] : null;

    // Fetch workout data from the new API
    const workoutResponse = await fetch(`https://full-strength-academy.onrender.com/api/exercises/type/${workoutType}`);
    if (!workoutResponse.ok) throw new Error("Failed to fetch workout data");
    const workoutData = await workoutResponse.json();
    const randomWorkout = workoutData.length > 0 ? workoutData[Math.floor(Math.random() * workoutData.length)] : null;

    updateMealAndWorkoutUI(randomMeal, randomWorkout);
    loadingMessage.textContent = '';
  } catch (error) {
    errorMessage.textContent = 'Failed to fetch meal or workout data';
  }
}

function updateMealAndWorkoutUI(mealData, workoutData) {
  if (mealData) {
    mealPlan.innerHTML = `
      <h3>Recommended Meal</h3>
      <p><strong>Name:</strong> ${mealData.name}</p>
      <p><strong>Focus Goal:</strong> ${mealData.focus_goal}</p>
      <p><strong>Calories:</strong> ${mealData.calories}</p>
    `;
  } else {
    mealPlan.innerHTML = '<p>No meals available for this category</p>';
  }

  if (workoutData) {
    workoutPlan.innerHTML = `
      <h3>Recommended Workout</h3>
      <p><strong>Name:</strong> ${workoutData.name}</p>
      <p><strong>Difficulty:</strong> ${workoutData.difficulty}</p>
    `;
  } else {
    workoutPlan.innerHTML = '<p>No workouts available for this category</p>';
  }
}

function updateChart(category) {
  const data = [18.5, 24.9, 29.9, 34.9, 39.9, 40.0];
  const labels = ['Underweight', 'Normal weight', 'Overweight', 'Obesity Class 1', 'Obesity Class 2', 'Obesity Class 3'];
  const color = getColorByCategory(category);

  if (bmiChartInstance) bmiChartInstance.destroy();

  bmiChartInstance = new Chart(bmiChart, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'BMI Risk',
        data,
        borderColor: color,
        fill: false,
        tension: 0.5,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Risk' }
        },
        x: {
          title: { display: true, text: 'BMI Category' }
        }
      }
    }
  });
}

function getColorByCategory(category) {
  const colorMap = {
    'Underweight': '#FFCC00',
    'Normal weight': '#00CC00',
    'Overweight': '#FF9933',
    'Obesity (Class 1)': '#FF6666',
    'Obesity (Class 2)': '#FF3333',
    'Obesity (Class 3)': '#CC0000'
  };
  return colorMap[category] || '#000000';
}
