import React, { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import RandomEncounterRoller from './RandomEncounterRoller';
import ReactionRollGenerator from './ReactionRollGenerator';
import MoraleCheckRoller from './MoraleCheckRoller';
import CombatPhaseTracker from './CombatPhaseTracker';
import DungeonExplorationTurnTracker from './DungeonExplorationTurnTracker';
import ExperienceCalculator from './ExperienceCalculator';
import DiceRollerPanel from './DiceRollerPanel';
import MarchingOrder from './MarchingOrder';
import SurpriseCheck from './SurpriseCheck';
import MonsterGenerator from './MonsterGenerator';

function Home() {
  const [diceBox, setDiceBox] = useState(null);
  const [diceColor, setDiceColor] = useState('#fb2c36'); // Default color
  const [generatedMonsterXP, setGeneratedMonsterXP] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const initializeDiceBox = async () => {
      const db = new DiceBox('body', {
        themeColor: diceColor,
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
            const canvases = document.body.getElementsByTagName('canvas');
            Array.from(canvases).forEach((canvas) => {
              if (canvas.parentNode === document.body) {
                canvas.style.opacity = '0';
              }
            });
            setTimeout(() => {
              try {
                db.clear();
                Array.from(canvases).forEach((canvas) => {
                  if (canvas.parentNode === document.body) {
                    canvas.style.opacity = '1';
                  }
                });
                console.log('Dice faded out and cleared after 10 seconds');
              } catch (err) {
                console.warn('DiceBox clear failed:', err);
                Array.from(canvases).forEach((canvas) => {
                  if (canvas.parentNode === document.body) {
                    canvas.style.opacity = '1';
                  }
                });
              }
            }, 1000);
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
  }, []); // Run once on mount

  // Update diceBox themeColor when diceColor changes
  useEffect(() => {
    if (diceBox) {
      diceBox.updateConfig({ themeColor: diceColor });
    }
  }, [diceColor, diceBox]);

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-6 font-darkfantasy home">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-darkfantasy-highlight mb-6 text-center">
          Welcome to the TTRPG Website
        </h1>
        <p className="text-darkfantasy-neutral text-center mb-8">
          Explore rules, manage characters, and more for your game.
        </p>
        <p className="text-darkfantasy-neutral text-center mb-8 font-sans">
          In this page you will find various tools to enhance your tabletop RPG experience.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-1">
            <CombatPhaseTracker diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <DungeonExplorationTurnTracker />
          </div>
          <div className="col-span-1">
            <MarchingOrder />
          </div>
          <div className="col-span-1">
            <RandomEncounterRoller diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <SurpriseCheck diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <ReactionRollGenerator diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <MoraleCheckRoller diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <ExperienceCalculator summonedXP={generatedMonsterXP} />
          </div>
          <div className="col-span-1">
            <DiceRollerPanel diceBox={diceBox} diceColor={diceColor} setDiceColor={setDiceColor} />
          </div>
          <div className="col-span-1">
            <MonsterGenerator
              diceBox={diceBox} 
              onMonsterGenerated={setGeneratedMonsterXP}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;