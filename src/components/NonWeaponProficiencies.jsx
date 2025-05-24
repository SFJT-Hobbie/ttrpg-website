import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const nonWeaponProficiencyOptions = {
  // Wilderness Exploration Skills
  'Wilderness Exploration Skills': {
    Strength: {
      Climbing: {
        slots: 1,
        stat: 'Strength',
        description: 'Scale crumbling cliffs or gnarled husks, defying the yawning dark below.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Dexterity: {
      Firecraft: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Wrest fleeting flames from damp rot or sparse twigs in a forsaken wild.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Constitution: {
      SurvivalWilderness: {
        slots: 2,
        stat: 'Constitution',
        description: 'Endure the wild’s cruel embrace, clawing shelter from a land eager to kill.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      EndureElements: {
        slots: 1,
        stat: 'Constitution',
        description: 'Stand firm against howling gales or blistering heat in a world without mercy.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
      AltitudeAdaptation: {
        slots: 1,
        stat: 'Constitution',
        description: 'Breathe thin, frigid air atop jagged peaks, where even hope thins.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Intelligence: {
      Trailblazing: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Carve paths through tangled decay, leaving marks swallowed by time.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      NavigationSurface: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Find bearings under a hollow sky, guided by faded stars or broken stone.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Herbalism: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Harvest twisted roots for salves or poisons from a blighted, uncaring earth.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
    Wisdom: {
      Foraging: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Scrounge bitter weeds or gaunt prey from a wild that starves its own.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
      Tracking: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Follow faint scars of blood or tread, hunting through a cursed expanse.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      WeatherSense: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Read the sky’s grim portents—storms or frost—to brace for its wrath.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Charisma: {
      AnimalHandling: {
        slots: 1,
        stat: 'Charisma',
        description: 'Tame feral beasts or weary mules, binding them to your doomed path.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
  },

  // Dungeon Exploration Skills
  'Dungeon Exploration Skills': {
    Dexterity: {
      TrapDetection: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Spot rusted snares or hidden blades lurking in the dungeon’s gloom.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Caving: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Wriggle through jagged chasms, where stone bites and darkness swallows.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Constitution: {
      SurvivalUnderground: {
        slots: 2,
        stat: 'Constitution',
        description: 'Thrive in cramped, airless depths, scavenging life from rot and stone.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
    Intelligence: {
      NavigationUnderground: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Thread twisting crypts and caves, where landmarks crumble to dust.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Stonecraft: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Read the dungeon’s bones for secrets or collapse, a faint edge in the dark.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      LightManagement: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Stretch guttering flames or dim sparks to pierce the dungeon’s night.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
      Mapping: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Scrawl crude maps on tattered scraps, a frail shield against oblivion.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Wisdom: {
      DungeonHearing: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Hear the dungeon’s whispers—distant claws or dripping doom—in silence.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      HazardSense: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Sense the unseen—shifting walls or ambushes—in a world that betrays.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      DungeonHazards: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Know the crypt’s cruel gifts—gas or floods—and evade their grasp.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
  },

  // Physical & Movement Skills
  'Physical & Movement Skills': {
    Strength: {
      Swimming: {
        slots: 1,
        stat: 'Strength',
        description: 'Battle murky tides or flooded tombs, where the drowned hunger.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
      Athletics: {
        slots: 1,
        stat: 'Strength',
        description: 'Leap rifts or heave debris, defying a land that craves your fall.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Dexterity: {
      Riding: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Master skeletal mounts or weary beasts across a realm of ash and ruin.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Stealth: {
        slots: 2,
        stat: 'Dexterity',
        description: 'Fade into shadow or bracken, unseen by the hollow and the cursed.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Constitution: {
      Endurance: {
        slots: 2,
        stat: 'Constitution',
        description: 'Outlast endless marches through mire and ruin, unbent by despair.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
  },

  // Crafting & Trade Skills
  'Crafting & Trade Skills': {
    Strength: {
      Metalworking: {
        slots: 2,
        stat: 'Strength',
        description: 'Forge jagged steel from rust and fire, a bulwark against the dark.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      Boating: {
        slots: 1,
        stat: 'Strength',
        description: 'Paddle frail craft through black waters, fleeing shores of despair.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Dexterity: {
      Carpentry: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Hammer splintered wood into fleeting shelters amid a crumbling world.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Leatherworking: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Stitch ragged hides into gear, flayed from the silent dead.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      RopeUse: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Knot frayed ropes into lifelines, a thread against the abyss.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Intelligence: {
      WeaponRepair: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Mend notched blades or bent hafts, delaying their final ruin.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Engineering: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Craft crude machines or mend relics, bending them to grim purpose.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
      },
    },
    Wisdom: {
      Cooking: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Turn foul scraps into meager meals, staving off the gnaw of hunger.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
      Scavenging: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Pry rusted tools or scraps from bones, a scavenger’s grim harvest.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
  },

  // Social & Interaction Skills
  'Social & Interaction Skills': {
    Intelligence: {
      Signaling: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Send faint cries or flickers through gloom, a call to the lost.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Charisma: {
      Persuasion: {
        slots: 1,
        stat: 'Charisma',
        description: 'Wring aid or secrets from hollowed souls with a silvered tongue.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Etiquette: {
        slots: 1,
        stat: 'Charisma',
        description: 'Appease mad cults or ruin-lords with rites from a forgotten age.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Intimidation: {
        slots: 1,
        stat: 'Charisma',
        description: 'Break wills with a voice forged in the fires of desolation.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Leadership: {
        slots: 2,
        stat: 'Charisma',
        description: 'Rally the broken into a grim host, marching through damnation.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      Barter: {
        slots: 1,
        stat: 'Charisma',
        description: 'Trade with gaunt wanderers or crypt-dwellers for scraps of survival.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
  },

  // Knowledge & Scholarship Skills
  'Knowledge & Scholarship Skills': {
    Intelligence: {
      History: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Recall tales of fallen realms, their bones buried in ash and time.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Languages: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Decipher the guttural chants or faded scripts of the long-dead.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      DungeonLore: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Know the builders of crypts, their traps a whisper of doom.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Astronomy: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Map the cold stars for guidance or omens in a fractured sky.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      Astrology: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Read celestial wounds for portents in a world teetering on ruin.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      Alchemy: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Mix rot and rust into potions or flames, a desperate alchemy.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      Cryptography: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Unravel ciphers etched by mad hands in dust and despair.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Runology: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Trace runes of power or peril, scarred into stone and decay.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Runosophy: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Plumb the mystic depths of runes, their secrets a double-edged curse.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
      },
      Nomothetic: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Grasp the laws of a broken world, bending fate with grim insight.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
      },
      NaturalSciences: {
        slots: 2,
        stat: 'Intelligence',
        description: 'Study the rot of stone and flesh for edges in a dying land.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
    Wisdom: {
      NaturalLore: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Know the twisted ways of beasts and thorns in a blighted wild.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Observation: {
        slots: 1,
        stat: 'Wisdom',
        description: 'See the faint scars of doom in shadow or dust, unheeded by most.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      VeiledLore: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Unearth forbidden truths and magics, a peril to the mind and soul.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: 'Special',
        trainingCost: 0,
      },
      MonsterLore: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Sense the weaknesses of horrors lurking in wilds and depths.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      GrayMagic: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Master the veiled arts of balance and control, drawing from the grey mists of forgotten stars.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
        restriction: 'Magic Users only; non-proficient starts at Attribute * 3, others at 0. Roll to learn spells, cast via slots.',
      },
      BlackMagic: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Wield the shadowed craft of ruin and decay, secrets plucked from the black void between constellations.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
        restriction: 'Magic Users only; non-proficient starts at Attribute * 3, others at 0. Roll to learn spells, cast via slots.',
      },
      WhiteMagic: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Channel the faint light of salvation and warding, gleaned from the pale gleam of distant stars.',
        difficulty: 'Rare',
        successesNeeded: 5,
        trainingTime: '2 months',
        trainingCost: 100,
        restriction: 'Magic Users only; non-proficient starts at Attribute * 3, others at 0. Roll to learn spells, cast via slots.',
      },
    },
  },

  // Combat & Tactics Skills
  'Combat & Tactics Skills': {
    Dexterity: {
      ImprovisedWeapons: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Turn broken junk or bones into tools of grim slaughter.',
        difficulty: 'Simple',
        successesNeeded: 2,
        trainingTime: '1 week',
        trainingCost: 10,
      },
    },
    Intelligence: {
      Tactics: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Weave plans of blood and retreat in the chaos of ruin and wood.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      AmbushTactics: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Set traps or spot foes in shadowed passes and crumbling halls.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Wisdom: {
      CombatAwareness: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Strike true in gloom or bracken, where death stalks unseen.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
      FirstAid: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Stitch flesh or brace bones with rags, a fleeting stay of ruin.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
  },

  // Miscellaneous & Utility Skills
  'Miscellaneous & Utility Skills': {
    Strength: {
      Mining: {
        slots: 2,
        stat: 'Strength',
        description: 'Tear through stone or earth, seeking ore or a breach in the dark.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
      },
    },
    Dexterity: {
      Thievery: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Pick rusted locks or frail traps for loot in a world of greed.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Camouflage: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Blend with mud and ash, a ghost in a land that hunts.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Calligraphy: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Scribe maps or runes with precision, ink teetering on oblivion.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Forgery: {
        slots: 1,
        stat: 'Dexterity',
        description: 'Craft false marks or scripts to deceive the desperate or dead.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Intelligence: {
      ToolImprovisation: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Shape crude tools from debris, a defiance of shattered lands.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      Appraisal: {
        slots: 1,
        stat: 'Intelligence',
        description: 'Judge the worth of tarnished relics in a market of despair.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
    },
    Wisdom: {
      Scouting: {
        slots: 1,
        stat: 'Wisdom',
        description: 'Peer through fog and dark, spying paths for the damned.',
        difficulty: 'Moderate',
        successesNeeded: 3,
        trainingTime: '2 weeks',
        trainingCost: 25,
      },
      NaturalMagic: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Channel the raw pulse of earth, flame, or wind, bending the elements to your will in a world that resists.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
        restriction: 'Non-proficient grants knowledge only (Attribute * 2); proficient enables casting (roll Wis * 5%, 1d6 mana to meter, 10 points to cast).',
      },
      VoiceAndForm: {
        slots: 2,
        stat: 'Wisdom',
        description: 'Speak nouns and verbs through cuneal catalysts, twisting the mundane—ice to water, spark to flame—in a hollow echo of creation.',
        difficulty: 'Complex',
        successesNeeded: 4,
        trainingTime: '1 month',
        trainingCost: 50,
        restriction: 'Non-proficient grants knowledge only (Attribute * 2); proficient enables casting (roll Wis * 5%, takes minutes to hours).',
      },
    },
  },
};

function NonWeaponProficiencies() {
  const location = useLocation();
  const navigate = useNavigate();
  const { character, imagePreview } = location.state || {};

  // Initialize proficiencies from character data
  const [proficiencies, setProficiencies] = useState(
    character?.data?.nonWeaponProficiencies || []
  );
  const [openCategories, setOpenCategories] = useState({});

  // Redirect if no character data
  useEffect(() => {
    if (!character) {
      navigate('/characters/new');
    }
  }, [character, navigate]);

  if (!character) {
    return null;
  }

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const addProficiency = (profName) => {
    if (!proficiencies.some((prof) => prof.name === profName)) {
      setProficiencies((prev) => [
        ...prev,
        { name: profName, value: 0 },
      ]);
    }
  };

  const removeProficiency = (profName) => {
    setProficiencies((prev) =>
      prev.filter((prof) => prof.name !== profName)
    );
  };

  const updateProficiencyValue = (profName, value) => {
    setProficiencies((prev) =>
      prev.map((prof) =>
        prof.name === profName ? { ...prof, value: Number(value) } : prof
      )
    );
  };

  const handleBack = () => {
    // Update character with new proficiencies
    const updatedCharacter = {
      ...character,
      data: {
        ...character.data,
        nonWeaponProficiencies: proficiencies,
      },
    };
    const targetPath = character.type === 'NPC' ? '/characters/new/npc' : '/characters/new/pc';
    navigate(targetPath, {
      state: { character: updatedCharacter, imagePreview, updatedProficiencies: proficiencies },
    });
  };

  const formatProficiency = (prof) => {
    return prof.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="min-h-screen bg-[#3c2f2f] p-6">
      <div className="bg-darkfantasy-primary rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6 text-center">
          Non-Weapon Proficiencies
        </h1>

        {/* Selected Proficiencies */}
        <div className="mb-6">
          <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
            Selected Proficiencies
          </h2>
          {proficiencies.length === 0 ? (
            <p className="text-darkfantasy-neutral">No proficiencies selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {proficiencies.map((prof) => (
                <div
                  key={prof.name}
                  className="flex items-center bg-darkfantasy-tertiary text-darkfantasy-neutral rounded px-2 py-1 text-sm"
                >
                  <span>{formatProficiency(prof.name)}</span>
                  <input
                    type="number"
                    value={prof.value}
                    onChange={(e) => updateProficiencyValue(prof.name, e.target.value)}
                    min="0"
                    max="100"
                    className="w-16 mx-2 px-1 py-0.5 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  />
                  <span>%</span>
                  <button
                    onClick={() => removeProficiency(prof.name)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proficiency Categories */}
        <div className="space-y-4">
          {Object.entries(nonWeaponProficiencyOptions).map(([category, stats]) => (
            <div key={category} className="border border-darkfantasy rounded">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left px-4 py-2 bg-darkfantasy-secondary text-darkfantasy-neutral font-darkfantasy flex justify-between items-center"
              >
                <span>{category}</span>
                <span>{openCategories[category] ? '−' : '+'}</span>
              </button>
              {openCategories[category] && (
                <div className="p-4 space-y-4">
                  {Object.entries(stats).map(([stat, proficienciesList]) => (
                    <div key={stat}>
                      <h3 className="text-lg font-darkfantasy text-darkfantasy-neutral mb-2">
                        {stat}
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(proficienciesList).map(([profName, details]) => (
                          <div
                            key={profName}
                            className="flex justify-between items-center bg-darkfantasy-tertiary p-2 rounded"
                          >
                            <div>
                              <p className="text-darkfantasy-neutral font-darkfantasy">
                                {formatProficiency(profName)}
                              </p>
                              <p className="text-sm text-darkfantasy-neutral">
                                {details.description}
                              </p>
                              <p className="text-xs text-darkfantasy-neutral">
                                Slots: {details.slots} | Difficulty: {details.difficulty} | Training: {details.trainingTime}, {details.trainingCost} cost
                                {details.restriction && ` | Restriction: ${details.restriction}`}
                              </p>
                            </div>
                            <button
                              onClick={() => addProficiency(profName)}
                              disabled={proficiencies.some((prof) => prof.name === profName)}
                              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-3 rounded hover:bg-[#661318] font-darkfantasy disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <div>
            <p>Base skill % = Attribute Value</p>
            <p>Proficient skill % = Attribute Value × 3</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 mt-5 rounded hover:bg-[#661318] font-darkfantasy"
          >
            Back to Character Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

export default NonWeaponProficiencies;