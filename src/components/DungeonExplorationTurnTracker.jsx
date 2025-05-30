import React, { useState } from 'react';
import { PlusIcon, MinusIcon, RotateCcwIcon, FlameIcon, SunIcon, LampIcon } from 'lucide-react';

function DungeonExplorationTurnTracker() {
  const [currentTurn, setCurrentTurn] = useState(1);
  const [activeLightSource, setActiveLightSource] = useState(null);
  const [lightSourceStartTurn, setLightSourceStartTurn] = useState(null);

  const LIGHT_SOURCE_DURATIONS = {
    torch: 6,
    candle: 6,
    lantern: 24,
  };

  const incrementTurn = () => {
    setCurrentTurn((prev) => prev + 1);
  };

  const decrementTurn = () => {
    setCurrentTurn((prev) => Math.max(1, prev - 1));
  };

  const resetTurn = () => {
    setCurrentTurn(1);
    setActiveLightSource(null);
    setLightSourceStartTurn(null);
  };

  const toggleLightSource = (source) => {
    if (activeLightSource === source) {
      setActiveLightSource(null);
      setLightSourceStartTurn(null);
    } else {
      setActiveLightSource(source);
      setLightSourceStartTurn(currentTurn);
    }
  };

  const getRemainingTurns = () => {
    if (!activeLightSource || lightSourceStartTurn === null) return null;
    const duration = LIGHT_SOURCE_DURATIONS[activeLightSource];
    const turnsUsed = currentTurn - lightSourceStartTurn;
    return Math.max(0, duration - turnsUsed);
  };

  const renderLightSourceStatus = () => {
    const remainingTurns = getRemainingTurns();
    if (!activeLightSource) {
      return 'Select a light source';
    }
    return remainingTurns > 0
      ? `${activeLightSource.charAt(0).toUpperCase() + activeLightSource.slice(1)}: ${remainingTurns} turn${remainingTurns === 1 ? '' : 's'} remaining`
      : `${activeLightSource.charAt(0).toUpperCase() + activeLightSource.slice(1)}: Expired`;
  };

  return (
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Dungeon Turn Tracker</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy">Turn:</div>
      <div className="text-darkfantasy-highlight text-3xl font-darkfantasy font-medium">
        {currentTurn}
      </div>
      <div className="text-darkfantasy-neutral text-sm font-darkfantasy flex flex-col items-center space-y-2">
        <div className={getRemainingTurns() === 0 ? 'text-darkfantasy-accent animate-pulse-darkfantasy' : ''}>
          {renderLightSourceStatus()}
        </div>
        <div>
          <FlameIcon className={getRemainingTurns() === 0 ? 'w-8 h-8 m-2 text-darkfantasy-highlight' : 'w-8 h-8 m-2 text-darkfantasy-neutral'} />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleLightSource('torch')}
            className={`py-1 px-3 rounded text-sm font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${
              activeLightSource === 'torch'
                ? 'bg-darkfantasy-secondary text-darkfantasy-highlight shadow-darkfantasy-glow'
                : 'bg-darkfantasy-primary text-darkfantasy-neutral hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow'
            }`}
            aria-label="Toggle torch"
          >
            Torch
          </button>
          <button
            onClick={() => toggleLightSource('candle')}
            className={`py-1 px-3 rounded text-sm font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${
              activeLightSource === 'candle'
                ? 'bg-darkfantasy-secondary text-darkfantasy-highlight shadow-darkfantasy-glow'
                : 'bg-darkfantasy-primary text-darkfantasy-neutral hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow'
            }`}
            aria-label="Toggle candle"
          >
            Candle
          </button>
          <button
            onClick={() => toggleLightSource('lantern')}
            className={`py-1 px-3 rounded text-sm font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${
              activeLightSource === 'lantern'
                ? 'bg-darkfantasy-secondary text-darkfantasy-highlight shadow-darkfantasy-glow'
                : 'bg-darkfantasy-primary text-darkfantasy-neutral hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow'
            }`}
            aria-label="Toggle lantern"
          >
            Lantern
          </button>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={decrementTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentTurn === 1}
          aria-label="Decrement turn"
        >
          <MinusIcon className="w-5 h-5 text-darkfantasy-highlight" />
        </button>
        <button
          onClick={resetTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Reset turns"
        >
          <RotateCcwIcon className="w-5 h-5 text-darkfantasy-highlight" />
        </button>
        <button
          onClick={incrementTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Increment turn"
        >
          <PlusIcon className="w-5 h-5 text-darkfantasy-highlight" />
        </button>
      </div>
    </div>
  );
}

export default DungeonExplorationTurnTracker;