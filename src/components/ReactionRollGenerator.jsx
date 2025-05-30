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
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Reaction Roller</h3>
      <div className={`text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center ${rollResult !== null && rollResult <= 4 ? 'text-darkfantasy-accent animate-pulse-darkfantasy' : rollResult >= 10 ? 'text-darkfantasy-highlight' : ''}`}>
        {getReactionMessage()}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={rollReaction}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Roll for reaction"
        >
          <UsersIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Roll
        </button>
      </div>
    </div>
  );
}

export default ReactionRollGenerator;