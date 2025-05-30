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
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-6 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Experience Calculator</h3>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="char-level" title="Your character's level">
            Character Level
          </label>
          <input
            id="char-level"
            type="number"
            value={charLevel}
            onChange={(e) => setCharLevel(e.target.value)}
            min="1"
            placeholder="e.g., 8"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter character level"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="highest-hd" title="Hit dice of the highest HD monster">
            Highest HD Monster
          </label>
          <input
            id="highest-hd"
            type="number"
            value={highestHD}
            onChange={(e) => setHighestHD(e.target.value)}
            min="1"
            placeholder="e.g., 7"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter highest HD monster"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="treasure-sp" title="Treasure in silver pieces">
            Treasure (SP)
          </label>
          <input
            id="treasure-sp"
            type="number"
            value={treasureSP}
            onChange={(e) => setTreasureSP(e.target.value)}
            min="0"
            placeholder="e.g., 7000"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter treasure in silver pieces"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="additional-monsters-xp" title="Total XP from additional monsters">
            Additional Monsters XP
          </label>
          <input
            id="additional-monsters-xp"
            type="number"
            value={additionalMonstersXP}
            onChange={(e) => setAdditionalMonstersXP(e.target.value)}
            min="0"
            placeholder="e.g., 300"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter additional monsters XP"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="misc-xp-bonus" title="Miscellaneous XP (e.g., quests)">
            Misc XP Bonus
          </label>
          <input
            id="misc-xp-bonus"
            type="number"
            value={miscXPBonus}
            onChange={(e) => setMiscXPBonus(e.target.value)}
            min="0"
            placeholder="e.g., 500"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter miscellaneous XP bonus"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="party-members" title="Number of party members">
            Party Members
          </label>
          <input
            id="party-members"
            type="number"
            value={partyMembers}
            onChange={(e) => setPartyMembers(e.target.value)}
            min="1"
            placeholder="e.g., 4"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter number of party members"
          />
        </div>
        <div className="flex flex-col sm:col-span-2">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="xp-bonus-percent" title="Additional XP bonus percentage">
            XP Bonus (%)
          </label>
          <input
            id="xp-bonus-percent"
            type="number"
            value={xpBonusPercent}
            onChange={(e) => setXpBonusPercent(e.target.value)}
            min="0"
            placeholder="e.g., 15 for +15%"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter XP bonus percentage"
          />
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={calculateXP}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Calculate XP"
        >
          <CalculatorIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Calculate
        </button>
        {summonedXP > 0 && (
          <button
            onClick={importMonsterXP}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Import aberrant XP"
          >
            <ImportIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
            Import XP
          </button>
        )}
        <button
          onClick={clearInputs}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Clear inputs"
        >
          <TrashIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Clear
        </button>
      </div>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy font-medium flex-grow flex items-center justify-center">
        {result !== null ? (
          <span className="text-darkfantasy-highlight animate-pulse-darkfantasy">{result} XP per member</span>
        ) : (
          'Enter values to calculate XP'
        )}
      </div>
    </div>
  );
}

export default ExperienceCalculator;