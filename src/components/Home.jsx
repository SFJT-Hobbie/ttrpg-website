import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { DiceBoxContext } from '../DiceBoxContext';
import RandomEncounterRoller from './RandomEncounterRoller';
import ReactionRollGenerator from './ReactionRollGenerator';
import MoraleCheckRoller from './MoraleCheckRoller';
import CombatPhaseTracker from './CombatPhaseTracker';
import DungeonExplorationTurnTracker from './DungeonExplorationTurnTracker';
import ExperienceCalculator from './ExperienceCalculator';
import MarchingOrder from './MarchingOrder';
import SurpriseCheck from './SurpriseCheck';
import MonsterGenerator from './MonsterGenerator';

function Home() {
  const { diceBox } = useContext(DiceBoxContext);
  const [generatedMonsterXP, setGeneratedMonsterXP] = useState(0);

  // Define the list of tools with their components and props
  const tools = [
    { name: 'Combat Phase Tracker', component: CombatPhaseTracker, props: { diceBox } },
    { name: 'Dungeon Exploration Turn Tracker', component: DungeonExplorationTurnTracker, props: {} },
    { name: 'Marching Order', component: MarchingOrder, props: {} },
    { name: 'Random Encounter Roller', component: RandomEncounterRoller, props: { diceBox } },
    { name: 'Surprise Check', component: SurpriseCheck, props: { diceBox } },
    { name: 'Reaction Roll Generator', component: ReactionRollGenerator, props: { diceBox } },
    { name: 'Morale Check Roller', component: MoraleCheckRoller, props: { diceBox } },
    { name: 'Experience Calculator', component: ExperienceCalculator, props: { summonedXP: generatedMonsterXP } },
    { name: 'Monster Generator', component: MonsterGenerator, props: { diceBox, onMonsterGenerated: setGeneratedMonsterXP } },
  ];

  // State to track which tools are enabled, initialized from localStorage
  const [enabledTools, setEnabledTools] = useState(() => {
    const saved = localStorage.getItem('enabledTools');
    return saved
      ? JSON.parse(saved)
      : tools.reduce((acc, tool) => {
          acc[tool.name] = true;
          return acc;
        }, {});
  });

  // State to show/hide the settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Save enabledTools to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('enabledTools', JSON.stringify(enabledTools));
  }, [enabledTools]);

  return (
    <div className="min-h-screen p-6 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/assets/runes-bg.png')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto">
        <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent mb-4 text-center tracking-tight">
          Aristilia RPG
        </h1>
        <p className="text-darkfantasy-neutral text-center mb-4 text-base font-darkfantasy font-medium">
          Tools for your grimdark RPG odyssey
        </p>
        <p className="text-darkfantasy-neutral/80 text-center mb-8 text-sm font-darkfantasy">
          Wield these artifacts to navigate a world of dungeons, wilderness, sorcery, and cosmic horror.
        </p>

        {/* Settings Button */}
        <div className="text-center m-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mb-4 p-2 bg-darkfantasy-secondary text-darkfantasy-neutral rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy text-sm"
            aria-label={showSettings ? 'Hide settings' : 'Show settings'}
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 p-4 bg-darkfantasy-tertiary rounded border-darkfantasy-heavy shadow-darkfantasy relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 text-darkfantasy-neutral hover:text-darkfantasy-highlight"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-darkfantasy-highlight font-darkfantasy-heading mb-4">
              Configure Tools
            </h2>
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={tool.name}
                  checked={enabledTools[tool.name]}
                  onChange={() =>
                    setEnabledTools((prev) => ({
                      ...prev,
                      [tool.name]: !prev[tool.name],
                    }))
                  }
                  className="mr-2 accent-darkfantasy-accent"
                  aria-label={`Toggle ${tool.name}`}
                />
                <label htmlFor={tool.name} className="text-darkfantasy-neutral font-darkfantasy text-sm">
                  {tool.name}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool) =>
            enabledTools[tool.name] ? (
              <div key={tool.name} className="col-span-1 flex flex-col h-full min-h-[200px] bg-darkfantasy-tertiary rounded border-darkfantasy shadow-darkfantasy">
                <tool.component {...tool.props} />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;