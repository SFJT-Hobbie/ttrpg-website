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
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Dice Roller</h3>
      <div className="flex items-center space-x-2">
        <label className="text-darkfantasy-neutral text-xs font-sans">Dice Color</label>
        <input
          type="color"
          value={diceColor}
          onChange={(e) => setDiceColor(e.target.value)}
          className="color-picker"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {dice.map((die) => (
          <button
            key={die}
            onClick={() => rollDie(die)}
            disabled={isRolling}
            className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-3 rounded font-bold flex items-center justify-center text-sm ${
              isRolling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-darkfantasy-secondary/80'
            }`}
          >
            <Dices className="w-4 h-4 mr-1" />
            {die}
          </button>
        ))}
      </div>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {result ? `${result.die}: ${result.roll}` : 'Roll a die'}
      </div>
      {result && (
        <button
          onClick={clearResult}
          className="bg-red-800 text-darkfantasy-neutral py-2 px-4 rounded hover:bg-red-900 font-bold flex items-center"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          Clear
        </button>
      )}
    </div>
  );
}

export default DiceRollerPanel;