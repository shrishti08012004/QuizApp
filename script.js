// Elements
const categoryScreen = document.getElementById("category-screen");
const categorySelect = document.getElementById("category-select");
const startBtn = document.getElementById("start-btn");

const quizScreen = document.getElementById("quiz-screen");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const timerElement = document.getElementById("timer");
const nextButton = document.getElementById("next-btn");

const resultScreen = document.getElementById("result-screen");
const scoreText = document.getElementById("score-text");
const categoryText = document.getElementById("category-text");
const playAgainBtn = document.getElementById("play-again-btn");

// Variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
const TIMER_DURATION = 10; // 5 seconds per question
let timeLeft = TIMER_DURATION;
const tickSound = new Audio('tictic.mp3'); // Tick sound

// Fetch questions from API
async function fetchQuestions(categoryId) {
  const url = `https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`;
  const res = await fetch(url);
  const data = await res.json();

  questions = data.results.map(q => {
    const allAnswers = [...q.incorrect_answers];
    const correctIndex = Math.floor(Math.random() * (allAnswers.length + 1));
    allAnswers.splice(correctIndex, 0, q.correct_answer);

    return {
      question: decodeHTML(q.question),
      answers: allAnswers.map(a => ({
        text: decodeHTML(a),
        correct: a === q.correct_answer
      }))
    };
  });

  startQuiz();
}

// Decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Start Quiz
function startQuiz() {
  categoryScreen.style.display = "none";
  resultScreen.style.display = "none";
  quizScreen.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

// Timer functions
function startTimer() {
  timeLeft = TIMER_DURATION;
  timerElement.style.color = "#222"; 
  timerElement.innerText = `Time Left: ${timeLeft}s ⏱`;

  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft > 0) tickSound.play();

    if (timeLeft <= 2) timerElement.style.color = "red";
    else timerElement.style.color = "#222";

    timerElement.innerText = `Time Left: ${timeLeft}s ⏱`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      showCorrectAnswer();
      nextButton.style.display = "block"; 
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  tickSound.pause();
  tickSound.currentTime = 0;
}

// Show correct answer
function showCorrectAnswer() {
  Array.from(answerButtons.children).forEach(button => {
    if (button.dataset.correct === "true") button.classList.add("correct");
    button.disabled = true;
  });
}

// Show Question
function showQuestion() {
  resetState();
  nextButton.style.display = "none"; // hide next button
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerText = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    if (answer.correct) button.dataset.correct = "true";
    button.addEventListener("click", selectAnswer);
    answerButtons.appendChild(button);
  });

  startTimer();
}

// Reset state
function resetState() {
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Select answer
function selectAnswer(e) {
  stopTimer();
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";
  if (isCorrect) score++;

  showCorrectAnswer();

  if (!isCorrect) selectedBtn.classList.add("incorrect");

  nextButton.style.display = "block";
}

// Next button
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

// Show result screen
function showResult() {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";

  const total = questions.length;
  scoreText.innerText = `You scored ${score} out of ${total}`;

  const percent = (score / total) * 100;
  let category;
  if (percent === 100) category = "Genius 🧠✨";
  else if (percent >= 80) category = "Excellent 🌟";
  else if (percent >= 60) category = "Intelligent 👍";
  else if (percent >= 40) category = "Good 😊";
  else category = "Keep Practicing 💪";

  categoryText.innerText = `Your Performance: ${category}`;
}

// Play again
playAgainBtn.addEventListener("click", () => {
  categoryScreen.style.display = "block";
  resultScreen.style.display = "none";
});

// Start quiz
startBtn.addEventListener("click", () => {
  const selectedCategory = categorySelect.value;
  fetchQuestions(selectedCategory);
});


