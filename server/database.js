// Sample word database
const words = [
  { word: "cat", difficulty: "easy", category: "animals" },
  { word: "dog", difficulty: "easy", category: "animals" },
  { word: "bird", difficulty: "easy", category: "animals" },
  { word: "elephant", difficulty: "medium", category: "animals" },
  { word: "giraffe", difficulty: "medium", category: "animals" },
  { word: "penguin", difficulty: "hard", category: "animals" },
  { word: "apple", difficulty: "easy", category: "food" },
  { word: "banana", difficulty: "easy", category: "food" },
  { word: "orange", difficulty: "easy", category: "food" },
  { word: "broccoli", difficulty: "medium", category: "food" },
  { word: "spaghetti", difficulty: "hard", category: "food" },
  { word: "pizza", difficulty: "medium", category: "food" },
  { word: "red", difficulty: "easy", category: "colors" },
  { word: "blue", difficulty: "easy", category: "colors" },
  { word: "green", difficulty: "easy", category: "colors" },
  { word: "purple", difficulty: "medium", category: "colors" },
  { word: "yellow", difficulty: "medium", category: "colors" },
  { word: "orange", difficulty: "medium", category: "colors" }
];

// Function to get a random word
function getRandomWord(difficulty = null, category = null) {
  let filteredWords = words;
  
  if (difficulty) {
    filteredWords = filteredWords.filter(w => w.difficulty === difficulty);
  }
  
  if (category) {
    filteredWords = filteredWords.filter(w => w.category === category);
  }
  
  if (filteredWords.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[randomIndex];
}

// Function to get all categories
function getCategories() {
  return [...new Set(words.map(w => w.category))];
}

// Function to get all difficulties
function getDifficulties() {
  return [...new Set(words.map(w => w.difficulty))];
}

module.exports = {
  getRandomWord,
  getCategories,
  getDifficulties
}; 