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
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Morale Roller</h3>
      <div className={`text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center ${rollResult !== null && rollResult > moraleScore ? 'text-darkfantasy-accent animate-pulse-darkfantasy' : ''}`}>
        {getMoraleMessage()}
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="morale-score">
            Morale Score
          </label>
          <input
            id="morale-score"
            type="number"
            value={moraleScore}
            onChange={handleMoraleChange}
            min="2"
            max="12"
            className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Set morale score"
          />
        </div>
        <button
          onClick={rollMorale}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Roll for morale"
        >
          <SwordsIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Roll
        </button>
      </div>
    </div>
  );
}

export default MoraleCheckRoller;