import React, { useState } from 'react';
import { ZapIcon, TrashIcon } from 'lucide-react';

function MonsterGenerator({ diceBox, onMonsterGenerated }) {
  const [casterLevel, setCasterLevel] = useState('');
  const [desiredHD, setDesiredHD] = useState('');
  const [ritualBonus, setRitualBonus] = useState(0);
  const [entityType, setEntityType] = useState('Aberraciones Mágicas');
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const entityConfigs = {
    'Aberraciones Mágicas': {
      diceColor: '#6B8E23', // Sickly green
      forms: [
        'Melted Humanoid', 'Starspawn Chimera', 'Crystalline Aberration', 'Voidborn Leviathan',
        'Flesh Nebula', 'Astral Husk', 'Corrupted Seraph', 'Mind Shard',
        'Celestial Carcass', 'Chaos Bloom', 'Stellar Wraith', 'Rift Spawn',
        'Bone Constellation', 'Pulsing Monolith', 'Etheric Parasite', 'Cosmic Effigy',
      ],
      appendageTypes: [
        'Crystalline Spikes', 'Writhing Tentacles', 'Clawed Starlimbs', 'Pulsing Pseudopods',
        'Glowing Tendrils', 'Void Shards', 'Bone Spurs', 'Etheric Claws',
        'Starfire Whips', 'Psychic Fangs',
      ],
      powers: [
        'Psychic Scream', 'Gravity Warp', 'Starfire Burst', 'Mind Devour', 'Reality Fracture',
        'Astral Pull', 'Time Distortion', 'Void Gaze', 'Energy Drain', 'Chaos Pulse',
        'Stellar Cloak', 'Corruption Touch', 'Nebula Shroud', 'Cosmic Howl', 'Memory Theft',
        'Rift Step', 'Star Bleed', 'Mind Flay', 'Void Surge', 'Astral Binding',
      ],
      specialEffects: ['Cosmic Collapse', 'Stellar Overload', 'Mind Plague', 'Reality Shatter'],
      appendageDie: '1d6',
      powerDie: '1d4',
      formDie: '1d16',
      powerRollDie: '1d20',
      specialEffectDie: '1d4',
      dominationModifier: 0,
    },
    'Los Otros': {
      diceColor: '#4B0082', // Dark purple
      forms: [
        'Shadow Veil', 'Ethereal Stain', 'Void Silhouette', 'Dark Nebula',
        'Gloom Wraith', 'Eclipse Phantom', 'Shade Cluster', 'Null Sprite',
        'Dusk Serpent', 'Abyssal Smudge', 'Night Shard', 'Silence Husk',
      ],
      appendageTypes: [
        'Shadow Tendrils', 'Gloom Claws', 'Void Wisps', 'Eclipse Shards',
        'Dusk Fangs', 'Null Spikes', 'Shade Ribbons', 'Abyssal Threads',
      ],
      powers: [
        'Light Drain', 'Silence Aura', 'Cold Embrace', 'Fear Pulse', 'Invisibility',
        'Stasis Field', 'Shadow Step', 'Despair Wave', 'Nullify Magic', 'Entropy Touch',
        'Gloom Veil', 'Void Whisper', 'Dark Bind', 'Eclipse Pulse', 'Silence Siphon',
        'Abyssal Drain',
      ],
      specialEffects: ['Universal Stasis', 'Light Void', 'Shadow Plague'],
      appendageDie: '1d4',
      powerDie: '1d3',
      formDie: '1d12',
      powerRollDie: '1d16',
      specialEffectDie: '1d3',
      dominationModifier: -2,
    },
    'Las Bondades': {
      diceColor: '#8B3A3A', // Ember-ashen
      forms: [
        'Radiant Angel', 'Light Wraith', 'Celestial Orb', 'Harmonic Veil',
        'Divine Effigy', 'Starlit Seraph', 'Prism Specter', 'Glory Shard',
        'Dawn Serpent', 'Halo Wisp', 'Light Monolith', 'Equilibrium Sprite',
      ],
      appendageTypes: [
        'Luminous Wings', 'Radiant Tendrils', 'Crystal Blades', 'Light Whips',
        'Starfire Claws', 'Harmonic Spikes', 'Prism Fangs', 'Divine Ribbons',
      ],
      powers: [
        'Blinding Flash', 'Psychic Lure', 'Harmony Pulse', 'Life Drain', 'Divine Smite',
        'Illusion Veil', 'Teleport', 'Mind Crush', 'Healing Paradox', 'Equilibrium Burst',
        'Starlight Cage', 'Glory Aura', 'Prism Strike', 'Divine Whisper', 'Light Siphon',
        'Celestial Wrath',
      ],
      specialEffects: ['Cosmic Judgment', 'Radiant Cataclysm', 'Harmony Rift'],
      appendageDie: '1d4',
      powerDie: '1d3',
      formDie: '1d12',
      powerRollDie: '1d16',
      specialEffectDie: '1d3',
      dominationModifier: 2,
    },
  };

  const prepareCanvas = () => {
    const canvases = document.body.getElementsByTagName('canvas');
    Array.from(canvases).forEach((canvas) => {
      if (canvas.parentNode === document.body) {
        canvas.style.opacity = '1';
        canvas.style.display = 'block';
      }
    });
  };

  const rollMonster = async () => {
    if (!diceBox || isRolling) {
      console.error(isRolling ? 'Roll in progress' : 'DiceBox not initialized');
      return;
    }
    setIsRolling(true);
    prepareCanvas();

    const cl = Number(casterLevel) || 1;
    const hd = Number(desiredHD) || 1;
    const config = entityConfigs[entityType];
    const saveTarget = 14; // Adjust per your ruleset

    // Set dice color
    diceBox.updateConfig({ themeColor: config.diceColor });

    try {
      // Save vs. Magic
      const saveRoll = await diceBox.roll('1d20').then((r) => r[0].value);
      const saveSuccess = saveRoll + cl >= saveTarget;

      // Form
      const formRoll = await diceBox.roll(config.formDie).then((r) => r[0].value);
      const form = saveSuccess ? config.forms[formRoll - 1] : config.forms[Math.floor(Math.random() * config.forms.length)];

      // Appendages
      let appendageCount = 0;
      for (let i = 0; i < hd; i++) {
        const roll = await diceBox.roll(config.appendageDie).then((r) => r[0].value);
        appendageCount += roll;
      }
      const appendageTypeRoll = await diceBox.roll(`1d${config.appendageTypes.length}`).then((r) => r[0].value);
      const appendageType = config.appendageTypes[appendageTypeRoll - 1];

      // Powers (Unique)
      let powerCount = 0;
      for (let i = 0; i < hd; i++) {
        const roll = await diceBox.roll(config.powerDie).then((r) => r[0].value);
        powerCount += roll;
      }
      const powerMap = new Map();
      const availablePowers = [...config.powers];
      for (let i = 0; i < Math.min(powerCount, availablePowers.length); i++) {
        const roll = await diceBox.roll(config.powerRollDie).then((r) => r[0].value);
        const index = (roll - 1) % availablePowers.length;
        const power = availablePowers.splice(index, 1)[0];
        powerMap.set(power, (powerMap.get(power) || 0) + 1);
      }
      const selectedPowers = Array.from(powerMap.entries()).map(([power, count]) => count > 1 ? `${power} (x${count})` : power);

      // Special Effect
      let specialEffect = null;
      if (!saveSuccess) {
        const specialChance = await diceBox.roll('1d6').then((r) => r[0].value);
        if (specialChance === 1) {
          const specialRoll = await diceBox.roll(config.specialEffectDie).then((r) => r[0].value);
          specialEffect = config.specialEffects[specialRoll - 1];
        }
      }

      // Domination
      const casterRoll = await diceBox.roll('1d20').then((r) => r[0].value) + cl + ritualBonus;
      const creatureRoll = await diceBox.roll('1d20').then((r) => r[0].value) + hd + config.dominationModifier;
      const domination = casterRoll > creatureRoll ? 'Controlled' : casterRoll < creatureRoll ? 'Hostile' : 'Unstable';

      const monster = {
        hd,
        form,
        appendages: `${appendageCount} ${appendageType}`,
        powers: selectedPowers.join(', '),
        specialEffect,
        domination,
        xp: hd * 100,
        entityType,
      };

      setResult(monster);
      onMonsterGenerated(monster.xp);
      console.log('Monster Generated:', monster);
      setIsRolling(false);
    } catch (err) {
      console.error('Monster Generation Error:', err);
      setIsRolling(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setCasterLevel('');
    setDesiredHD('');
    setRitualBonus(0);
    setEntityType('Aberraciones Mágicas');
  };

  // Determine card class for entity type (preserved)
  const getCardClass = (entityType) => {
    switch (entityType) {
      case 'Aberraciones Mágicas':
        return 'monster-card-aberracion';
      case 'Los Otros':
        return 'monster-card-otros';
      case 'Las Bondades':
        return 'monster-card-bondades';
      default:
        return 'monster-card';
    }
  };

  return (
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-6 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Eldritch Transmutation</h3>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="caster-level" title="Caster level for summoning">
            Caster Level
          </label>
          <input
            type="number"
            id="caster-level"
            value={casterLevel}
            onChange={(e) => setCasterLevel(e.target.value)}
            min="1"
            placeholder="e.g., 3"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter caster level"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="desired-hd" title="Desired hit dice for the creature">
            Desired HD
          </label>
          <input
            type="number"
            id="desired-hd"
            value={desiredHD}
            onChange={(e) => setDesiredHD(e.target.value)}
            min="1"
            placeholder="e.g., 5"
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Enter desired HD"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="ritual-bonus" title="Ritual bonus based on SP spent">
            Ritual Bonus
          </label>
          <select
            id="ritual-bonus"
            value={ritualBonus}
            onChange={(e) => setRitualBonus(Number(e.target.value))}
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Select ritual bonus"
          >
            <option value={0}>None (0 SP)</option>
            <option value={1}>+1 (100 SP)</option>
            <option value={2}>+2 (200 SP)</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-darkfantasy-neutral text-sm font-darkfantasy" htmlFor="entity-type" title="Type of cosmic entity to summon">
            Entity Type
          </label>
          <select
            id="entity-type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
            aria-label="Select entity type"
          >
            <option value="Aberraciones Mágicas">Aberraciones Mágicas</option>
            <option value="Los Otros">Los Otros</option>
            <option value="Las Bondades">Las Bondades</option>
          </select>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={rollMonster}
          disabled={isRolling}
          className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Generate monster"
        >
          <ZapIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
          Generate
        </button>
        {result && (
          <button
            onClick={clearResult}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Clear monster result"
          >
            <TrashIcon className="w-5 h-5 text-darkfantasy-highlight mr-2" />
            Clear
          </button>
        )}
      </div>
      <div className="text-darkfantasy-accent text-lg font-darkfantasy font-medium flex-grow flex flex-col items-center justify-center w-full">
        {result ? (
          <div className={getCardClass(result.entityType)}>
            <h4 className="font-darkfantasy-heading text-darkfantasy-highlight">{`${result.hd} HD ${result.form} (${result.entityType})`}</h4>
            <div className="section">
              <p><strong>Appendages:</strong> {result.appendages}</p>
            </div>
            <div className="section">
              <p><strong>Powers:</strong> {result.powers || 'None'}</p>
            </div>
            {result.specialEffect && (
              <div className="section">
                <p><strong>Special Effect:</strong> {result.specialEffect}</p>
              </div>
            )}
            <div className="section">
              <p><strong>Status:</strong> {result.domination}</p>
            </div>
            <div className="section">
              <p><strong>XP Value:</strong> {result.xp}</p>
            </div>
          </div>
        ) : (
          'Generate a cosmic entity'
        )}
      </div>
    </div>
  );
}

export default MonsterGenerator;