import React, { useState } from 'react';
import { UsersIcon } from 'lucide-react';

function ReactionRollGenerator({ diceBox }) {
  const [rollResult, setRollResult] = useState(null);

  const REACTION_TABLE = {
    2: 'Hostile: Attacks immediately',
    3: 'Unfriendly: May attack or flee',
    4: 'Unfriendly: May attack or flee',
    5: 'Cautious: Wary, may negotiate',
    6: 'Cautious: Wary, may negotiate',
    7: 'Neutral: Open to negotiation',
    8: 'Neutral: Open to negotiation',
    9: 'Neutral: Open to negotiation',
    10: 'Friendly: Willing to help',
    11: 'Friendly: Willing to help',
    12: 'Very Friendly: Eager to assist',
  };

  const rollReaction = () => {
    if (!diceBox) {
      console.error('DiceBox not yet initialized');
      return;
    }
    diceBox.roll('2d6', { clear: false }).then((results) => {
      const total = results.reduce((sum, roll) => sum + roll.value, 0);
      setRollResult(total);
      console.log(`Reaction Roll: ${total}`);
    }).catch((err) => {
      console.error('Reaction Roll Error:', err);
    });
  };

  const getReactionMessage = () => {
    if (rollResult === null) return 'Roll to determine reaction';
    return `${REACTION_TABLE[rollResult]} (Rolled ${rollResult})`;
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Reaction Roll Generator</h3>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {getReactionMessage()}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={rollReaction}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <UsersIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ReactionRollGenerator;