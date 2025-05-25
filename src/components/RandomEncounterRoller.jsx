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
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Random Encounter Roller</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {getEncounterMessage()}
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-darkfantasy-neutral text-xs font-sans">
            Encounter on 1 to
          </label>
          <input
            type="number"
            value={encounterChance}
            onChange={handleChanceChange}
            min="1"
            max="6"
            className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <button
          onClick={rollEncounter}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <Dice5Icon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default RandomEncounterRoller;