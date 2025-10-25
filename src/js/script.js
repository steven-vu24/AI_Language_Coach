const grammarPrompts = [
  "Describe your morning routine.",
  "Talk about your favorite movie.",
  "What do you usually eat for breakfast?",
  "Explain how you spend your weekends.",
  "Describe a recent trip you took.",
];

const accentPrompts = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "It’s a beautiful day to learn languages.",
  "Practice makes perfect.",
  "Can you repeat this sentence clearly?",
];

const grammarBtn = document.getElementById("grammarBtn");
const accentBtn = document.getElementById("accentBtn");
const micButton = document.getElementById("micButton");
const promptText = document.getElementById("promptText");
const feedbackOutput = document.getElementById("feedbackOutput");
const statusText = document.getElementById("statusText");

let currentMode = "grammar";

function getRandomPrompt(list) {
  return list[Math.floor(Math.random() * list.length)];
}

grammarBtn.addEventListener("click", () => {
  currentMode = "grammar";
  grammarBtn.classList.replace("bg-gray-200", "bg-indigo-600");
  grammarBtn.classList.replace("text-gray-700", "text-white");
  accentBtn.classList.replace("bg-indigo-600", "bg-gray-200");
  accentBtn.classList.replace("text-white", "text-gray-700");

  promptText.textContent = getRandomPrompt(grammarPrompts);
  feedbackOutput.textContent = "";
});

accentBtn.addEventListener("click", () => {
  currentMode = "accent";
  accentBtn.classList.replace("bg-gray-200", "bg-indigo-600");
  accentBtn.classList.replace("text-gray-700", "text-white");
  grammarBtn.classList.replace("bg-indigo-600", "bg-gray-200");
  grammarBtn.classList.replace("text-white", "text-gray-700");

  promptText.textContent = getRandomPrompt(accentPrompts);
  feedbackOutput.textContent = "";
});

micButton.addEventListener("click", () => {
  micButton.classList.add("animate-pulse", "bg-red-500");
  statusText.textContent = "Recording...";
  feedbackOutput.textContent = "";

  setTimeout(() => {
    micButton.classList.remove("animate-pulse", "bg-red-500");
    micButton.classList.add("bg-indigo-600");
    statusText.textContent = "Processing...";

    setTimeout(() => {
      statusText.textContent = "";
      feedbackOutput.innerHTML =
        currentMode === "grammar"
          ? "✅ <b>Grammar check:</b> Your response is grammatically correct!"
          : "🎧 <b>Accent feedback:</b> Clear pronunciation! Keep practicing!";
    }, 1000);
  }, 2000);
});
