import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { Results } from './components/Results';

const AppContent: React.FC = () => {
  const { gameState } = useGame();

  if (gameState.phase === 'lobby') {
    return <Lobby />;
  }

  if (gameState.phase === 'results') {
    return <Results />;
  }

  // Phase: playing
  // If we have round results calculated, show interim results? 
  // For now, based on requirements, Admin controls flow. 
  // If admin clicked 'Calculate', usually we'd want to see results.
  // My gameState logic: calculateRoundResults updates state but keeps phase as 'playing' (or potentially 'round_results'?)
  // Let's check logic: calculateRoundResults updates `roundResults`. 
  // The requirement says "Round ends -> Admin checks results".
  // I should probably have an interim result view or show results at the bottom of game screen.
  // For simplicity: If roundResults for current round exist, show Results component (interim).
  // Or add a 'round_results' phase in backend. 

  // User logic: "Started game -> Round proceeds -> recorded as score -> Admin view results".
  // I will stick to: Game component stays active until Admin clicks Next Round.
  // Maybe show current score in Game component?

  return <Game />;
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
};

export default App;
