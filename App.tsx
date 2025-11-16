import React, { useState, useEffect, useCallback } from 'react';
import { COUNTRIES } from './constants';
import type { Country } from './types';

// Helper function outside component to prevent re-creation on renders
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const difficultySettings = {
  'Lätt': { optionsCount: 3, label: 'Lätt' },
  'Medium': { optionsCount: 5, label: 'Medium' },
  'Svårt': { optionsCount: 7, label: 'Svårt' },
};
type Difficulty = keyof typeof difficultySettings;


const App: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [options, setOptions] = useState<Country[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Lätt');

  const setupNewRound = useCallback(() => {
    setIsAnswered(false);
    setFeedback(null);
    setSelectedGuess(null);

    const shuffledCountries = shuffleArray(COUNTRIES);
    const correctCountry = shuffledCountries.pop();
    if (!correctCountry) return;

    setCurrentCountry(correctCountry);

    const incorrectOptionsCount = difficultySettings[difficulty].optionsCount - 1;
    const incorrectOptions = shuffledCountries.slice(0, incorrectOptionsCount);

    const shuffledOptions = shuffleArray([correctCountry, ...incorrectOptions]);
    setOptions(shuffledOptions);
  }, [difficulty]);

  useEffect(() => {
    setupNewRound();
  }, [setupNewRound]);

  const handleGuess = (guessedCountry: Country) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedGuess(guessedCountry.name);

    if (guessedCountry.name === currentCountry?.name) {
      setScore(prevScore => prevScore + 1);
      setFeedback({ message: 'Rätt! +1 Poäng', type: 'success' });
    } else {
      setFeedback({ message: `Fel! Rätt svar var ${currentCountry?.name}.`, type: 'error' });
    }

    setTimeout(() => {
      setupNewRound();
    }, 2000);
  };

  const resetGame = () => {
    setScore(0);
    setupNewRound();
  };
  
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setScore(0);
  };

  const getButtonClass = (option: Country) => {
    if (!isAnswered) {
      return 'bg-blue-600 hover:bg-blue-500';
    }

    const isCorrect = option.name === currentCountry?.name;
    const isSelected = option.name === selectedGuess;

    if (isCorrect) {
      return 'bg-green-600 animate-pulse';
    }
    
    if (isSelected && !isCorrect) {
      return 'bg-red-600';
    }

    return 'bg-slate-700 opacity-50';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-4">Kan du världens flaggor?</h1>
        
        <div className="flex justify-center gap-2 mb-4">
          {(Object.keys(difficultySettings) as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                difficulty === level
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {difficultySettings[level].label}
            </button>
          ))}
        </div>

        <p className="text-xl md:text-2xl font-semibold text-slate-300 mb-6">Poäng: {score}</p>

        {currentCountry ? (
          <>
            <div className="text-8xl md:text-9xl mb-8 select-none" aria-label={`Flagga för ${currentCountry.name}`}>
              {currentCountry.flag}
            </div>
            <div className={`grid gap-4 ${options.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {options.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleGuess(option)}
                  disabled={isAnswered}
                  className={`w-full text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-cyan-500/50 ${getButtonClass(option)} ${!isAnswered ? 'hover:scale-105' : 'cursor-not-allowed'}`}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <div className="h-8 mt-6 flex items-center justify-center">
              {feedback && (
                <p className={`text-lg font-medium ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <p>Laddar spel...</p>
        )}

        <button 
          onClick={resetGame}
          className="mt-6 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Börja om
        </button>
      </div>
       <footer className="text-center text-slate-500 mt-8 text-sm">
        Skapad med React & Tailwind CSS.
      </footer>
    </div>
  );
};

export default App;
