import React, { useState } from 'react';
import { Dice5Icon } from 'lucide-react';

function RandomEncounterRoller({ diceBox }) {
  const [rollResult, setRollResult] = useState(null);
  const [encounterChance, setEncounterChance] = useState(1);

  const rollEncounter = () => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('1d6', { clear: false }).then((results) => {
      const roll = results[0].value;
      setRollResult(roll);
      console.log(`Random Encounter Roll: ${roll}`);
    }).catch((err) => {
      console.error('Random Encounter Roll Error:', err);
    });
  };

  const getEncounterMessage = () => {
    if (rollResult === null) return 'Roll to check for an encounter';
    return rollResult <= encounterChance
      ? `Encounter! (Rolled ${rollResult})`
      : `No encounter (Rolled ${rollResult})`;
  };

  const handleChanceChange = (e) => {
    const value = Math.max(1, Math.min(6, Number(e.target.value) || 1));
    setEncounterChance(value);
  };

  return (
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Random Encounter Roller</h3>
      <div className={`text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center ${rollResult !== null && rollResult <= encounterChance ? 'text-darkfantasy-highlight animate-pulse-darkfantasy' : ''}`}>
        {getEncounterMessage()}
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="encounter-chance">
            Encounter on 1 to
          </label>
          <input
            id="encounter-chance"
            type="number"
            value={encounterChance}
            onChange={handleChanceChange}
            min="1"
            max="6"
            className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Set encounter chance"
          />
        </div>
        <button
          onClick={rollEncounter}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Roll for random encounter"
        >
          <Dice5Icon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Roll
        </button>
      </div>
    </div>
  );
}

export default RandomEncounterRoller;