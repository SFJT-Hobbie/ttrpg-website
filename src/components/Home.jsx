import React, { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import RandomEncounterRoller from './RandomEncounterRoller';
import ReactionRollGenerator from './ReactionRollGenerator';
import MoraleCheckRoller from './MoraleCheckRoller';
import CombatPhaseTracker from './CombatPhaseTracker';
import DungeonExplorationTurnTracker from './DungeonExplorationTurnTracker';

function Home() {
  const [diceBox, setDiceBox] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const initializeDiceBox = async () => {
      const db = new DiceBox('body', {
        themeColor: '#fb2c36',
        assetPath: '/assets/',
        theme: 'rock',
        scale: 10,
        gravity: 2,
        spinForce: 3,
        throwForce: 5,
        cameraPosition: { x: 0, y: 100, z: 0 },
        boxWidth: window.innerWidth,
        boxHeight: window.innerHeight,
      });

      try {
        await db.init();
        console.log('DiceBox initialized');
        db.onRollComplete = (results) => {
          if (results && results.length > 0) {
            const total = results.reduce((sum, die) => sum + die.value, 0);
            console.log(`Roll Complete: ${total}`);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            try {
              db.clear();
              console.log('Dice cleared after 10 seconds');
            } catch (err) {
              console.warn('DiceBox clear failed:', err);
              const canvases = document.body.getElementsByTagName('canvas');
              Array.from(canvases).forEach((canvas) => {
                if (canvas.parentNode === document.body) {
                  canvas.style.display = 'none';
                }
              });
            }
          }, 10000);
        };
        setDiceBox(db);
      } catch (err) {
        console.error('DiceBox initialization failed:', err);
      }
    };

    initializeDiceBox();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (diceBox) {
        try {
          diceBox.clear();
        } catch (err) {
          console.warn('DiceBox clear failed:', err);
        }
        const canvases = document.body.getElementsByTagName('canvas');
        Array.from(canvases).forEach((canvas) => {
          if (canvas.parentNode === document.body) {
            document.body.removeChild(canvas);
          }
        });
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-6 font-darkfantasy home">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-darkfantasy-highlight mb-6 text-center">
          Welcome to the TTRPG Website
        </h1>
        <p className="text-darkfantasy-neutral text-center mb-8">
          Explore rules, manage characters, and write journals for your game.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1">
            <CombatPhaseTracker diceBox={diceBox} /> {/* Pass diceBox prop */}
          </div>
          <div className="col-span-1">
            <DungeonExplorationTurnTracker />
          </div>
          <div className="col-span-1">
            <RandomEncounterRoller diceBox={diceBox} />
          </div>
          <div className="col-span-1">
            <ReactionRollGenerator diceBox={diceBox} />
          </div>
          <div className="col-span-1">
            <MoraleCheckRoller diceBox={diceBox} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;