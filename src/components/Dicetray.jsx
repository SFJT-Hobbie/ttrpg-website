/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import { ErrorBoundary } from 'react-error-boundary';
import { Dices, X } from 'lucide-react';
import './Dicetray.css';

function DiceTrayErrorBoundary({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      <p>Error loading Dice Tray: {error.message}</p>
      <button
        className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        onClick={resetErrorBoundary}
      >
        Retry
      </button>
    </div>
  );
}

function DiceTray() {
  const [isOpen, setIsOpen] = useState(false);
  const mountRef = useRef(null);
  const diceBoxRef = useRef(null);

  const diceTypes = [
    { name: 'd4', notation: '1d4' },
    { name: 'd6', notation: '1d6' },
    { name: 'd8', notation: '1d8' },
    { name: 'd10', notation: '1d10' },
    { name: 'd12', notation: '1d12' },
    { name: 'd20', notation: '1d20' },
    { name: 'd100', notation: '1d100' },
  ];

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const selector = '#dice-box';
    const diceBox = new DiceBox(selector, {
      themeColor: '#fb2c36',
      assetPath: '/assets/',
      theme: 'rock',
      scale: 10,
      gravity: 2,
      spinForce: 3,
      throwForce: 5,
      cameraPosition: { x: 0, y: 100, z: 0 },
      boxWidth: 300,
      boxHeight: 200,
    });

    diceBoxRef.current = diceBox;

    diceBox
      .init()
      .then(() => {
        console.log('DiceBox initialized');
        diceBox.onRollComplete = (results) => {
          if (results && results.length > 0) {
            const total = results.reduce((sum, die) => sum + die.value, 0);
            const dieName =
              diceTypes.find((d) => d.notation === results[0].notation)?.name || 'Unknown';
            console.log({ dieName, value: total });
          }
        };
      })
      .catch((err) => {
        console.error('DiceBox initialization failed:', err);
      });

    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.clear();
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
        }
      }
    };
  }, [isOpen]);

  const rollDie = (notation) => {
    if (diceBoxRef.current) {
      diceBoxRef.current.roll(notation, { clear: false }); // No more clear here!
    }
  };

  const clearDice = () => {
    if (diceBoxRef.current) {
      diceBoxRef.current.clear();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="bg-darkfantasy-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-[#661318]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Dices />}
      </button>

      {isOpen && (
        <ErrorBoundary FallbackComponent={DiceTrayErrorBoundary} onReset={() => setIsOpen(false)}>
          <div className="mt-2 bg-[#3c2f2f] border-[#8a7b5e] border-2 p-4 rounded-lg shadow-lg flex flex-col items-center w-80 h-[500px]">
            <div
              id="dice-box"
              ref={mountRef}
              className="dice-box mb-4 border border-darkfantasy rounded-lg shadow-md overflow-hidden h-90"
            ></div>

            <div className="grid grid-cols-4 gap-2 w-full sm:grid-cols-3">
              {diceTypes.map((die) => (
                <button
                  key={die.name}
                  className="bg-darkfantasy-primary font-darkfantasy text-darkfantasy-neutral px-2 py-1 rounded text-sm hover:text-white hover:bg-[#661318]"
                  onClick={() => rollDie(die.notation)}
                >
                  {die.name}
                </button>
              ))}
            </div>

            <button
              onClick={clearDice}
              className="mt-4 bg-red-700 text-white px-4 py-1 rounded hover:bg-red-800"
            >
              Clear
            </button>
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default DiceTray;