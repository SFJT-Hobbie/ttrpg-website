import React, { useState } from 'react';
import { ShieldAlertIcon, TrashIcon } from 'lucide-react';

function SurpriseCheck({ diceBox }) {
  const [partyResult, setPartyResult] = useState(null);
  const [monsterResult, setMonsterResult] = useState(null);

  const rollSurprise = (type) => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('1d6').then((results) => {
      const total = results.reduce((sum, roll) => sum + roll.value, 0);
      const isSurprised = total <= 2; // 2-in-6 chance
      const result = isSurprised ? `${type} Surprised!` : `${type} Not Surprised`;
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

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Surprise Check</h3>
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
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex flex-col items-center justify-center">
        <div>{partyResult || 'No party result'}</div>
        <div>{monsterResult || 'No monster result'}</div>
      </div>
    </div>
  );
}

export default SurpriseCheck;