import React, { useState } from 'react';
import { SwordsIcon } from 'lucide-react';

function MoraleCheckRoller({ diceBox }) {
  const [rollResult, setRollResult] = useState(null);
  const [moraleScore, setMoraleScore] = useState(7);

  const rollMorale = () => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('2d6', { clear: false }).then((results) => {
      const total = results.reduce((sum, roll) => sum + roll.value, 0);
      setRollResult(total);
      console.log(`Morale Roll: ${total}`);
    }).catch((err) => {
      console.error('Morale Roll Error:', err);
    });
  };

  const getMoraleMessage = () => {
    if (rollResult === null) return 'Roll to check morale';
    return rollResult > moraleScore
      ? `Flees! (Rolled ${rollResult} vs Morale ${moraleScore})`
      : `Fights! (Rolled ${rollResult} vs Morale ${moraleScore})`;
  };

  const handleMoraleChange = (e) => {
    const value = Math.max(2, Math.min(12, Number(e.target.value) || 7));
    setMoraleScore(value);
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Morale Check Roller</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {getMoraleMessage()}
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-darkfantasy-neutral text-xs font-sans">
            Morale Score
          </label>
          <input
            type="number"
            value={moraleScore}
            onChange={handleMoraleChange}
            min="2"
            max="12"
            className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <button
          onClick={rollMorale}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <SwordsIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default MoraleCheckRoller;