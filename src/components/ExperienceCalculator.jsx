import React, { useState } from 'react';
import { CalculatorIcon, TrashIcon, ImportIcon } from 'lucide-react';

function ExperienceCalculator({ summonedXP = 0 }) {
  const [charLevel, setCharLevel] = useState('');
  const [highestHD, setHighestHD] = useState('');
  const [treasureSP, setTreasureSP] = useState('');
  const [additionalMonstersXP, setAdditionalMonstersXP] = useState('');
  const [miscXPBonus, setMiscXPBonus] = useState('');
  const [partyMembers, setPartyMembers] = useState('');
  const [xpBonusPercent, setXpBonusPercent] = useState('');
  const [result, setResult] = useState(null);

  const calculateXP = () => {
    const cl = Number(charLevel) || 1;
    const hd = Number(highestHD) || 1;
    const sp = Number(treasureSP) || 0;
    const amxp = Number(additionalMonstersXP) || 0;
    const mxpb = Number(miscXPBonus) || 0;
    const pm = Number(partyMembers) || 1;
    const xpb = Number(xpBonusPercent) || 0;

    const baseXP = sp + (hd * 100) + amxp + mxpb;
    const ratio = Math.min(hd / cl, 1);
    const adjustedBaseXP = baseXP * ratio;
    const individualXP = adjustedBaseXP / pm;
    const finalIndividualXP = individualXP * (1 + xpb / 100);
    const roundedXP = Math.round(finalIndividualXP * 100) / 100;

    setResult(roundedXP);
  };

  const clearInputs = () => {
    setCharLevel('');
    setHighestHD('');
    setTreasureSP('');
    setAdditionalMonstersXP('');
    setMiscXPBonus('');
    setPartyMembers('');
    setXpBonusPercent('');
    setResult(null);
  };

  const importMonsterXP = () => {
    setAdditionalMonstersXP((prev) => (Number(prev) || 0) + summonedXP);
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Experience Calculator</h3>
      <div className="w-full grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Your character's level">
            Character Level
          </label>
          <input
            type="number"
            value={charLevel}
            onChange={(e) => setCharLevel(e.target.value)}
            min="1"
            placeholder="e.g., 8"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Hit dice of the highest HD monster">
            Highest HD Monster
          </label>
          <input
            type="number"
            value={highestHD}
            onChange={(e) => setHighestHD(e.target.value)}
            min="1"
            placeholder="e.g., 7"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Treasure in silver pieces">
            Treasure (SP)
          </label>
          <input
            type="number"
            value={treasureSP}
            onChange={(e) => setTreasureSP(e.target.value)}
            min="0"
            placeholder="e.g., 7000"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Total XP from additional monsters">
            Additional Monsters XP
          </label>
          <input
            type="number"
            value={additionalMonstersXP}
            onChange={(e) => setAdditionalMonstersXP(e.target.value)}
            min="0"
            placeholder="e.g., 300"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Miscellaneous XP (e.g., quests)">
            Misc XP Bonus
          </label>
          <input
            type="number"
            value={miscXPBonus}
            onChange={(e) => setMiscXPBonus(e.target.value)}
            min="0"
            placeholder="e.g., 500"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Number of party members">
            Party Members
          </label>
          <input
            type="number"
            value={partyMembers}
            onChange={(e) => setPartyMembers(e.target.value)}
            min="1"
            placeholder="e.g., 4"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
        <div className="flex flex-col col-span-2">
          <label className="text-darkfantasy-neutral text-xs font-sans" title="Additional XP bonus percentage">
            XP Bonus (%)
          </label>
          <input
            type="number"
            value={xpBonusPercent}
            onChange={(e) => setXpBonusPercent(e.target.value)}
            min="0"
            placeholder="e.g., 15 for +15%"
            className="px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-xs"
          />
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={calculateXP}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
        >
          <CalculatorIcon className="w-5 h-5" />
        </button>
        {summonedXP > 0 && (
          <button
            onClick={importMonsterXP}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold flex items-center"
          >
            <ImportIcon className="w-5 h-5 mr-2" />
            Import Aberrant XP
          </button>
        )}
        <button
          onClick={clearInputs}
          className="bg-red-800 text-darkfantasy-neutral py-2 px-4 rounded hover:bg-red-900 font-bold flex items-center"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy flex-grow flex items-center justify-center">
        {result !== null ? `${result} XP per member` : 'Enter values to calculate XP'}
      </div>
    </div>
  );
}

export default ExperienceCalculator;