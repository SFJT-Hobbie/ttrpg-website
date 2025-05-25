import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, Dice5Icon } from 'lucide-react';

const PHASES = [
  'Declaration',
  'Initiative Roll',
  'Movement',
  'Missiles',
  'Melee',
  'Spells',
  'Morale Check',
];

function CombatPhaseTracker({ diceBox }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

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
      console.log(`Initiative Roll: ${roll}`);
    }).catch((err) => {
      console.error('Initiative Roll Error:', err);
    });
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Combat Phase Tracker</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {PHASES[currentPhaseIndex]}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={prevPhase}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        {currentPhaseIndex === 1 && ( // Show button only during "Initiative Roll"
          <button
            onClick={rollInitiative}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
          >
            <Dice5Icon className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={nextPhase}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default CombatPhaseTracker;