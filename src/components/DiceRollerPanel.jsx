import React, { useState } from 'react';
import { Dices, TrashIcon } from 'lucide-react';

function DiceRollerPanel({ diceBox, diceColor, setDiceColor }) {
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const prepareCanvas = () => {
    const canvases = document.body.getElementsByTagName('canvas');
    Array.from(canvases).forEach((canvas) => {
      if (canvas.parentNode === document.body) {
        canvas.style.opacity = '1';
        canvas.style.display = 'block';
      }
    });
  };

  const rollDie = (die) => {
    if (!diceBox || isRolling) {
      console.error(isRolling ? 'Roll in progress' : 'DiceBox not initialized');
      return;
    }
    setIsRolling(true);
    prepareCanvas();
    diceBox.roll(`1${die}`).then((results) => {
      const roll = results[0].value;
      setResult({ die, roll });
      console.log(`${die} Roll: ${roll}`);
      setIsRolling(false);
    }).catch((err) => {
      console.error(`${die} Roll Error:`, err);
      setIsRolling(false);
    });
  };

  const clearResult = () => {
    setResult(null);
  };

  const dice = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  return (
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Dice Roller</h3>
      <div className="flex items-center space-x-2">
        <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="dice-color">
          Dice Color
        </label>
        <input
          id="dice-color"
          type="color"
          value={diceColor}
          onChange={(e) => setDiceColor(e.target.value)}
          className="w-8 h-8 bg-darkfantasy-primary border-darkfantasy rounded focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight cursor-pointer"
          aria-label="Select dice color"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {dice.map((die) => (
          <button
            key={die}
            onClick={() => rollDie(die)}
            disabled={isRolling}
            className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-3 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center justify-center text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${
              isRolling ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Roll ${die}`}
          >
            <Dices className="w-4 h-4 text-darkfantasy-highlight mr-1" />
            {die}
          </button>
        ))}
      </div>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy font-medium flex-grow flex items-center justify-center">
        {result ? (
          <span className="text-darkfantasy-highlight animate-pulse-darkfantasy">
            {result.die}: {result.roll}
          </span>
        ) : (
          'Roll a die'
        )}
      </div>
      {result && (
        <button
          onClick={clearResult}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Clear dice result"
        >
          <TrashIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Clear
        </button>
      )}
    </div>
  );
}

export default DiceRollerPanel;