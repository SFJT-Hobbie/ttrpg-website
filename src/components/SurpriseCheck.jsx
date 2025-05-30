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
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Surprise Check</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex flex-col items-center justify-center space-y-2">
        <div className={partyResult && partyResult.includes('Surprised') ? 'text-darkfantasy-accent animate-pulse-darkfantasy' : ''}>
          {partyResult || 'No party result'}
        </div>
        <div className={monsterResult && monsterResult.includes('Surprised') ? 'text-darkfantasy-accent animate-pulse-darkfantasy' : ''}>
          {monsterResult || 'No monster result'}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="party-surprise">
              Party Surprised on 1 to
            </label>
            <input
              id="party-surprise"
              type="number"
              value={partySurpriseChance}
              onChange={handlePartyChanceChange}
              min="1"
              max="6"
              className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
              aria-label="Set party surprise chance"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="monster-surprise">
              Monster Surprised on 1 to
            </label>
            <input
              id="monster-surprise"
              type="number"
              value={monsterSurpriseChance}
              onChange={handleMonsterChanceChange}
              min="1"
              max="6"
              className="w-16 px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
              aria-label="Set monster surprise chance"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => rollSurprise('Party')}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Roll for party surprise"
          >
            <ShieldAlertIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
            Party
          </button>
          <button
            onClick={() => rollSurprise('Monster')}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Roll for monster surprise"
          >
            <ShieldAlertIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
            Monster
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurpriseCheck;