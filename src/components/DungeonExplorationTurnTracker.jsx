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
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Dungeon Turn Tracker</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy">
        Turn:
      </div>
      <div className="text-darkfantasy-neutral text-3xl font-bold font-darkfantasy">
        {currentTurn}
      </div>
      <div className="text-darkfantasy-neutral text-xs text-left font-sans flex flex-col items-center space-y-2">
        <div>{renderLightSourceStatus()}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleLightSource('torch')}
            className={`py-1 px-3 rounded text-xs font-bold ${
              activeLightSource === 'torch'
                ? 'bg-red-800 text-darkfantasy-neutral'
                : 'bg-darkfantasy-secondary text-darkfantasy-neutral hover:bg-darkfantasy-secondary/80'
            }`}
          >
            Torch
          </button>
          <button
            onClick={() => toggleLightSource('candle')}
            className={`py-1 px-3 rounded text-xs font-bold ${
              activeLightSource === 'candle'
                ? 'bg-red-800 text-darkfantasy-neutral'
                : 'bg-darkfantasy-secondary text-darkfantasy-neutral hover:bg-darkfantasy-secondary/80'
            }`}
          >
            Candle
          </button>
          <button
            onClick={() => toggleLightSource('lantern')}
            className={`py-1 px-3 rounded text-xs font-bold ${
              activeLightSource === 'lantern'
                ? 'bg-red-800 text-darkfantasy-neutral'
                : 'bg-darkfantasy-secondary text-darkfantasy-neutral hover:bg-darkfantasy-secondary/80'
            }`}
          >
            Lantern
          </button>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={decrementTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
          disabled={currentTurn === 1}
        >
          <MinusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={resetTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <RotateCcwIcon className="w-5 h-5" />
        </button>
        <button
          onClick={incrementTurn}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default DungeonExplorationTurnTracker;