import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, Dice5Icon } from 'lucide-react';

const PHASES = [
  'Declaration',
  'Initiative',
  'Movement',
  'Missile',
  'Melee',
  'Spell',
  'Morale Check',
];

function CombatPhaseTracker({ diceBox }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [initiativeRoll, setInitiativeRoll] = useState(null);

  // Clear roll result when phase changes
  useEffect(() => {
    setInitiativeRoll(null);
  }, [currentPhaseIndex]);

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % PHASES.length);
  };

  const prevPhase = () => {
    setCurrentPhaseIndex((prev) => (prev - 1 + PHASES.length) % PHASES.length);
  };

  const rollInitiative = () => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('1d6', { clear: false }).then((results) => {
      const roll = results[0].value;
      setInitiativeRoll(roll);
      console.log(`Initiative Roll: ${roll}`);
    }).catch((err) => {
      console.error('Initiative Roll Error:', err);
    });
  };

  return (
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Combat Phase Tracker</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex flex-col items-center justify-center">
        <div className="font-darkfantasy-heading text-2xl text-darkfantasy-accent">
          {PHASES[currentPhaseIndex]}
        </div>
        {currentPhaseIndex === 1 && initiativeRoll !== null && (
          <div className="text-darkfantasy-highlight text-3xl font-darkfantasy font-medium mt-2 animate-pulse-darkfantasy">
            {initiativeRoll}
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={prevPhase}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Previous combat phase"
        >
          <ArrowLeftIcon className="w-5 h-5 text-darkfantasy-highlight" />
        </button>
        {currentPhaseIndex === 1 && (
          <button
            onClick={rollInitiative}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight animate-pulse-darkfantasy"
            aria-label="Roll initiative"
          >
            <Dice5Icon className="w-5 h-5 text-darkfantasy-highlight" />
          </button>
        )}
        <button
          onClick={nextPhase}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Next combat phase"
        >
          <ArrowRightIcon className="w-5 h-5 text-darkfantasy-highlight" />
        </button>
      </div>
    </div>
  );
}

export default CombatPhaseTracker;