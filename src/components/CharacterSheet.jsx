/* import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Image } from 'lucide-react';
import api from '../api'; */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Image, X } from 'lucide-react';
import api from '../api';

function CharacterSheet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [character, setCharacter] = useState(() => {
    const stateCharacter = location.state?.character;
    const updatedProficiencies = location.state?.updatedProficiencies;
    const updatedEquipment = location.state?.updatedEquipment;
    const updatedCurrency = location.state?.updatedCurrency;
    const updatedGridSize = location.state?.updatedGridSize;
    const defaultCharacter = {
      id: null,
      type: 'PC',
      data: {
        name: '',
        race: 'Human',
        class: 'Fighter',
        alignment: 'Neutral',
        level: 1,
        xp: 0,
        xpBonus: 0,
        ageStage: 'adult',
        abilityScores: {
          strength: 3,
          dexterity: 3,
          constitution: 3,
          intelligence: 3,
          wisdom: 3,
          charisma: 3,
        },
        racialBonuses: {},
        raceAbilities: {},
        classAbilities: {},
        languages: ['Common'],
        nonWeaponProficiencies: [],
        weaponProficiencies: [],
        currency: { gold: 0, silver: 0, copper: 0 },
        equipment: [],
        baseGrid: { rows: 5, cols: 5 },
        additionalSlots: [],
        valuables: {},
        hitPoints: 0,
        currentHP: 0,
        equippedArmor: '',
        equippedShield: '',
        customArmor: {},
        status: 'alive',
        deathDate: null,
        deathDescription: '',
        restingSite: '',
        picture: '',
        description: '',
        journals: [],
        bonusToHit: 0,
        bonusToSave: 0,
        closeQuarterMovement: 0,
        openFieldMovement: 0,
      },
    };

    if (stateCharacter) {
      return {
        ...stateCharacter,
        type: 'PC',
        data: {
          ...stateCharacter.data,
          nonWeaponProficiencies: updatedProficiencies || stateCharacter.data.nonWeaponProficiencies,
          equipment: updatedEquipment || stateCharacter.data.equipment,
          restingSite: stateCharacter.data.restingSite || '',
          currency: updatedCurrency || stateCharacter.data?.currency || defaultCharacter.data.currency,
          gridSize: updatedGridSize || stateCharacter.data?.gridSize || defaultCharacter.data.baseGrid,
          closeQuarterMovement: stateCharacter.data.closeQuarterMovement || 0,
          openFieldMovement: stateCharacter.data.openFieldMovement || 0,
        },
      };
    }
    return defaultCharacter;
  });

  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(character.data.picture || '');
  const [reviveDialogOpen, setReviveDialogOpen] = useState(false);

  const races = ['Beastmen', 'Dwarf', 'Elf', 'Halfling', 'Human', 'Verdant'];
  const classes = ['Fighter', 'Magic User', 'Specialist'];
  const alignments = ['Lawful', 'Neutral', 'Chaotic'];
  const ageStages = ['young', 'adult', 'elder'];
  const additionalLanguages = ['Elvish', 'Dwarvish', 'Halfling', 'Beastmen', 'Verdant'];
  const weaponProficiencyOptions = [
    'Sword', 'Axe', 'Mace', 'Staff', 'Spear', 'Dagger', 'Flail', 'Warhammer',
    'Two-Handed Sword', 'Morning Star', 'Glaive', 'Halberd', 'Quarterstaff',
    'Bow', 'Shortbow', 'Crossbow', 'Hand Crossbow', 'Light Crossbow', 'Sling',
  ];

  useEffect(() => {
    if (character.data.picture) {
      setImagePreview(character.data.picture);
    }
  }, [character.data.picture]);

  useEffect(() => {
    if (character.id && user) {
      const fetchCharacterData = async () => {
        setLoading(true);
        try {
          const inventoryItems = await api.getInventoryItems(character.id);
          setCharacter((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              equipment: inventoryItems.map((item) => ({
                id: item.id,
                name: item.name,
                slot_position: {
                  gridX: item.slot_position.gridX,
                  gridY: item.slot_position.gridY,
                  w: item.slot_position.w,
                  h: item.slot_position.h,
                },
              })),
            },
          }));
        } catch (err) {
          setError('Failed to load character inventory: ' + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCharacterData();
    }
  }, [character.id, user]);

  const formatProficiency = (prof) => {
    return prof.replace(/([A-Z])/g, ' $1').trim();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Image size must be less than 2MB');
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setImageError('Only PNG and JPEG images are allowed');
        return;
      }
      setImageError(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(character.data.picture || '');
      setImageError(null);
    }
  };

  const handleChange = (e, nestedField, subField) => {
    const { name, value } = e.target;
    if (nestedField) {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [nestedField]: {
            ...prev.data[nestedField],
            [subField]: Number(value) || value,
          },
        },
      }));
    } else {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: Number(value) || value,
        },
      }));
    }
  };

  const handleDeathFieldChange = async (e) => {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value,
      },
    }));

    if (character.id) {
      try {
        await api.updateCharacter(character.id, {
          ...character.data,
          [name]: value,
        });
      } catch (err) {
        setError('Failed to update death details: ' + err.message);
        console.error(err);
      }
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (selectedLang && !character.data.languages.includes(selectedLang)) {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          languages: [...prev.data.languages, selectedLang],
        },
      }));
    }
  };

  const removeLanguage = (lang) => {
    if (lang !== 'Common') {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          languages: prev.data.languages.filter((l) => l !== lang),
        },
      }));
    }
  };

  const handleWeaponProficiencyChange = (e) => {
    const selectedProf = e.target.value;
    if (selectedProf && !character.data.weaponProficiencies.includes(selectedProf)) {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          weaponProficiencies: [...prev.data.weaponProficiencies, selectedProf],
        },
      }));
    }
  };

  const removeWeaponProficiency = (prof) => {
    setCharacter((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        weaponProficiencies: prev.data.weaponProficiencies.filter((p) => p !== prof),
      },
    }));
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('character-images')
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from('character-images')
        .getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error.message);
      throw error;
    }
  };

  const handleRevive = async () => {
    try {
      const updatedData = {
        ...character.data,
        status: 'alive',
        deathDate: null,
        deathDescription: '',
        restingSite: '',
      };
      await api.updateCharacter(character.id, updatedData);
      setCharacter((prev) => ({
        ...prev,
        data: updatedData,
      }));
      setReviveDialogOpen(false);
    } catch (err) {
      setError('Failed to revive character: ' + err.message);
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a character.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let pictureUrl = character.data.picture || '';
      if (imageFile) {
        pictureUrl = await uploadImage(imageFile);
      }

      const characterData = {
        user_id: user.id,
        type: 'PC',
        name: character.data.name,
        data: {
          ...character.data,
          currency: character.data.currency,
          gridSize: character.data.gridSize,
          picture: pictureUrl,
        },
      };

      let savedCharacter;
      if (character.id) {
        savedCharacter = await api.updateCharacter(character.id, characterData.data);
        for (const item of character.data.equipment) {
          await api.upsertInventoryItem({
            id: item.id,
            character_id: character.id,
            name: item.name,
            slot_position: {
              gridX: item.slot_position.gridX,
              gridY: item.slot_position.gridY,
              w: item.slot_position.w,
              h: item.slot_position.h,
            },
          });
        }
      } else {
        const { data, error } = await supabase
          .from('characters')
          .insert(characterData)
          .select()
          .single();
        if (error) throw error;
        savedCharacter = data;
        for (const item of character.data.equipment) {
          await api.upsertInventoryItem({
            id: item.id,
            character_id: savedCharacter.id,
            name: item.name,
            slot_position: {
              gridX: item.slot_position.gridX,
              gridY: item.slot_position.gridY,
              w: item.slot_position.w,
              h: item.slot_position.h,
            },
          });
        }
      }

      navigate('/characters');
    } catch (err) {
      setError(err.message || 'Failed to save character');
      console.error('Error saving character:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className={`bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg shadow-darkfantasy p-6 max-w-4xl mx-auto ${character.data.status === 'deceased' ? 'blur-sm' : ''}`}>
        <h1 className="text-3xl font-darkfantasy-heading text-darkfantasy-accent mb-6 text-center">
          {character.id ? 'Chronicle of the Hero' : 'Forge a New Hero'}
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}
        {loading && (
          <p className="text-darkfantasy-neutral text-sm mb-4 text-center font-darkfantasy animate-pulse-darkfantasy">
            Inscribing the chronicle...
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy-heading text-darkfantasy-highlight">
              Essence of the Soul
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={character.data.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  required
                  disabled={loading}
                  aria-label="Character name"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Race
                </label>
                <select
                  name="race"
                  value={character.data.race}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character race"
                >
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Class
                </label>
                <select
                  name="class"
                  value={character.data.class}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character class"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Alignment
                </label>
                <select
                  name="alignment"
                  value={character.data.alignment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character alignment"
                >
                  {alignments.map((align) => (
                    <option key={align} value={align}>
                      {align}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Age Stage
                </label>
                <select
                  name="ageStage"
                  value={character.data.ageStage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character age stage"
                >
                  {ageStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Level
                </label>
                <input
                  type="number"
                  name="level"
                  value={character.data.level}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character level"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  XP
                </label>
                <input
                  type="number"
                  name="xp"
                  value={character.data.xp}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Character XP"
                />
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy-heading text-darkfantasy-highlight">
              Prowess of the Flesh
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(character.data.abilityScores).map((score) => (
                <div key={score}>
                  <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                    {score.charAt(0).toUpperCase() + score.slice(1)}
                  </label>
                  <input
                    type="number"
                    name={score}
                    value={character.data.abilityScores[score]}
                    onChange={(e) => handleChange(e, 'abilityScores', score)}
                    min="3"
                    max="18"
                    className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                    disabled={loading}
                    aria-label={`Character ${score}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Languages and Proficiencies */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy-heading text-darkfantasy-highlight">
              Tongues and Talents
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Languages (Common is eternal)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.languages.map((lang) => (
                    <span
                      key={lang}
                      className={`inline-flex items-center px-3 py-1 rounded text-sm font-darkfantasy ${
                        lang === 'Common'
                          ? 'bg-darkfantasy-secondary text-darkfantasy-neutral'
                          : 'bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy cursor-pointer hover:bg-darkfantasy-highlight/50 transition-all duration-300'
                      }`}
                      onClick={() => lang !== 'Common' && removeLanguage(lang)}
                    >
                      {lang}
                      {lang !== 'Common' && (
                        <X className="ml-2 w-4 h-4 text-red-600" />
                      )}
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleLanguageChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Add language"
                >
                  <option value="">Add Tongue</option>
                  {additionalLanguages
                    .filter((lang) => !character.data.languages.includes(lang))
                    .map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Non-Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.nonWeaponProficiencies.map((prof) => (
                    <span
                      key={prof.name}
                      className="inline-flex items-center px-3 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded text-sm font-darkfantasy"
                    >
                      {formatProficiency(prof.name)} ({prof.value}%)
                    </span>
                  ))}
                </div>
                <Link
                  to="/characters/new/non-weapon-proficiencies"
                  state={{ character, imagePreview }}
                  className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                  aria-label="Manage non-weapon proficiencies"
                >
                  Weave Non-Weapon Proficiencies
                </Link>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.weaponProficiencies.map((prof) => (
                    <span
                      key={prof}
                      className="inline-flex items-center px-3 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded text-sm font-darkfantasy cursor-pointer hover:bg-darkfantasy-highlight/50 transition-all duration-300"
                      onClick={() => removeWeaponProficiency(prof)}
                    >
                      {formatProficiency(prof)}
                      <X className="ml-2 w-4 h-4 text-red-600" />
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleWeaponProficiencyChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Add weapon proficiency"
                >
                  <option value="">Add Weapon Mastery</option>
                  {weaponProficiencyOptions
                    .filter((prof) => !character.data.weaponProficiencies.includes(prof))
                    .map((prof) => (
                      <option key={prof} value={prof}>
                        {formatProficiency(prof)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Health, Combat Stats, and Inventory */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy-heading text-darkfantasy-highlight">
              Vitality and Armaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Hit Points
                </label>
                <input
                  type="number"
                  name="hitPoints"
                  value={character.data.hitPoints}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Hit points"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Current HP
                </label>
                <input
                  type="number"
                  name="currentHP"
                  value={character.data.currentHP}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Current HP"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Bonus to Hit
                </label>
                <input
                  type="number"
                  name="bonusToHit"
                  value={character.data.bonusToHit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Bonus to hit"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Bonus to Save
                </label>
                <input
                  type="number"
                  name="bonusToSave"
                  value={character.data.bonusToSave}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Bonus to save"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Equipped Armor
                </label>
                <input
                  type="text"
                  name="equippedArmor"
                  value={character.data.equippedArmor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Equipped armor"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Equipped Shield
                </label>
                <input
                  type="text"
                  name="equippedShield"
                  value={character.data.equippedShield}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Equipped shield"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Close Quarter Movement
                </label>
                <input
                  type="number"
                  name="closeQuarterMovement"
                  value={character.data.closeQuarterMovement}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Close quarter movement"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Open Field Movement
                </label>
                <input
                  type="number"
                  name="openFieldMovement"
                  value={character.data.openFieldMovement}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                  aria-label="Open field movement"
                />
                <p className="text-darkfantasy-neutral text-xs font-darkfantasy mt-1">
                  Open Field Movement is Close Quarter Movement × 4
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Inventory
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.equipment.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center px-3 py-1 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded text-sm font-darkfantasy"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                {character.id ? (
                  <Link
                    to="/characters/new/inventory"
                    state={{ character, imagePreview }}
                    className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                    aria-label="Manage inventory"
                  >
                    Curate Inventory
                  </Link>
                ) : (
                  <span className="text-darkfantasy-neutral text-sm font-darkfantasy">
                    Inscribe character to curate inventory
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy-heading text-darkfantasy-highlight">
              Visage and Lore
            </h2>
            <div className="space-y-4 flex flex-col items-center">
              <div>
                <label htmlFor="profile-image" className="cursor-pointer">
                  <div className="w-40 h-40 rounded-full bg-dark border border-darkfantasy-heavy flex items-center justify-center overflow-hidden shadow-darkfantasy">
                    {imagePreview || character.data.picture ? (
                      <img
                        src={imagePreview || character.data.picture || 'https://via.placeholder.com/150'}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={(e) => console.error('Image failed to load:', e.target.src, e)}
                      />
                    ) : (
                      <Image className="w-8 h-8 text-darkfantasy-neutral" />
                    )}
                  </div>
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                  aria-label="Upload profile image"
                />
                {imageError && (
                  <p className="text-red-600 text-sm mt-2 font-darkfantasy text-center">
                    {imageError}
                  </p>
                )}
              </div>
              <textarea
                name="description"
                value={character.data.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300 h-32"
                placeholder="Etch the legend of your hero..."
                disabled={loading}
                aria-label="Character description"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save character"
            >
              {loading ? 'Inscribing...' : 'Seal the Chronicle'}
            </button>
          </div>
        </form>
      </div>

      {/* DECEASED Overlay */}
      {character.data.status === 'deceased' && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg p-6 max-w-md w-full text-center shadow-darkfantasy">
            <h1 className="text-4xl font-darkfantasy-heading text-darkfantasy-accent mb-4">
              FALLEN
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Tale of Demise
                </label>
                <textarea
                  name="deathDescription"
                  value={character.data.deathDescription}
                  onChange={handleDeathFieldChange}
                  className="w-full px-4 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300 h-24"
                  placeholder="Recount the grim fate that claimed them..."
                  aria-label="Death description"
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-1">
                  Resting Place
                </label>
                <input
                  type="text"
                  name="restingSite"
                  value={character.data.restingSite}
                  onChange={handleDeathFieldChange}
                  className="w-full px-4 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  placeholder="Where their ashes rest..."
                  aria-label="Resting site"
                />
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => navigate('/characters')}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Return to characters"
              >
                Return
              </button>
              <button
                onClick={() => setReviveDialogOpen(true)}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-dark-accent hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Revive character"
              >
                Defy Death
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revive Confirmation Dialog */}
      {reviveDialogOpen && (
        <div className="fixed inset-0 bg-darkfantasy-overlay bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-darkfantasy-tertiary border-darkfantasy-heavy rounded p-6 max-w-sm w-full text-center shadow-darkfantasy">
            <h2 className="text-2xl font-darkfantasy-heading text-darkfantasy-accent mb-4">
              Defy the Veil
            </h2>
            <p className="text-darkfantasy-neutral mb-4 font-darkfantasy">
              Dare you wrench {character.data.name} from the abyss? Such defiance of death may unravel the threads of fate, invoking curses untold.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setReviveDialogOpen(false)}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Cancel revival"
              >
                Spare Fate
              </button>
              <button
                onClick={handleRevive}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border border-darkfantasy hover:bg-dark-accent hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Confirm revival"
              >
                Resurrect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSheet;