import { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import { DiceBoxContext } from './DiceBoxContext';

export const DiceBoxProvider = ({ children }) => {
  const [diceBox, setDiceBox] = useState(null);
  const [diceColor, setDiceColor] = useState(
    localStorage.getItem('diceColor') || '#fb2c36'
  );
  const timeoutRef = useRef(null);

  useEffect(() => {
    const initDiceBox = async () => {
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
        db.onRollComplete = () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            try {
              db.clear();
              console.log('Dice cleared after 10 seconds');
            } catch (err) {
              console.warn('Dice clear failed:', err);
            }
          }, 10000);
        };
        setDiceBox(db);
      } catch (err) {
        console.error('DiceBox initialization failed:', err);
      }
    };
    initDiceBox();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (diceBox) {
        try {
          diceBox.clear();
        } catch (err) {
          console.warn('Dice clear failed:', err);
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

  useEffect(() => {
    if (diceBox) {
      diceBox.updateConfig({ themeColor: diceColor });
      localStorage.setItem('diceColor', diceColor);
    }
  }, [diceColor, diceBox]);

  return (
    <DiceBoxContext.Provider value={{ diceBox, diceColor, setDiceColor }}>
      {children}
    </DiceBoxContext.Provider>
  );
};