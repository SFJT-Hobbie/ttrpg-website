import React, { useState } from 'react';
import { ShieldAlertIcon } from 'lucide-react';

function SurpriseCheck({ diceBox }) {
  const [partyResult, setPartyResult] = useState(null);
  const [monsterResult, setMonsterResult] = useState(null);
  const [partySurpriseChance, setPartySurpriseChance] = useState(2); // Default 2-in-6
  const [monsterSurpriseChance, setMonsterSurpriseChance] = useState(2); // Default 2-in-6

  const rollSurprise = (type) => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('1d6').then((results) => {
      const total = results.reduce((sum, roll) => sum + roll.value, 0);
      const surpriseChance = type === 'Party' ? partySurpriseChance : monsterSurpriseChance;
      const isSurprised = total <= surpriseChance;
      const result = isSurprised ? `${type} Surprised! (Rolled ${total})` : `${type} Not Surprised (Rolled ${total})`;
      if (type === 'Party') {
        setPartyResult(result);
      } else {
        setMonsterResult(result);
      }
      console.log(`${type} Surprise Roll: ${total} - ${result}`);
    }).catch((err) => {
      console.error(`${type} Surprise Roll Error:`, err);
    });
  };

  const handlePartyChanceChange = (e) => {
    const value = Math.max(1, Math.min(6, Number(e.target.value) || 1));
    setPartySurpriseChance(value);
  };

  const handleMonsterChanceChange = (e) => {
    const value = Math.max(1, Math.min(6, Number(e.target.value) || 1));
    setMonsterSurpriseChance(value);
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Surprise Check</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex flex-col items-center justify-center">
        <div>{partyResult || 'No party result'}</div>
        <div>{monsterResult || 'No monster result'}</div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-y-4 flex-col">
          <div className="flex items-center space-x-2 justify-end">
            <label className="text-darkfantasy-neutral text-xs font-sans">
              Party Surprised on 1 to
            </label>
            <input
              type="number"
              value={partySurpriseChance}
              onChange={handlePartyChanceChange}
              min="1"
              max="6"
              className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
            />
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <label className="text-darkfantasy-neutral text-xs font-sans">
              Monster Surprised on 1 to
            </label>
            <input
              type="number"
              value={monsterSurpriseChance}
              onChange={handleMonsterChanceChange}
              min="1"
              max="6"
              className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => rollSurprise('Party')}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
          >
            <ShieldAlertIcon className="w-5 h-5 mr-2" />
            Party
          </button>
          <button
            onClick={() => rollSurprise('Monster')}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
          >
            <ShieldAlertIcon className="w-5 h-5 mr-2" />
            Monster
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurpriseCheck;