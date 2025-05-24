import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Image } from 'lucide-react';
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
      type: 'PC', // Hardcoded to 'PC'
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
        additionalSlots: {},
        valuables: {},
        hitPoints: 0,
        currentHP: 0,
        equippedArmor: '',
        equippedShield: '',
        customArmor: {},
        customShield: {},
        status: 'alive',
        deathDate: null,
        deathDescription: '',
        restingSite: '',
        picture: '',
        description: '',
        journals: [],
        bonusToHit: 0,
        bonusToSave: 0,
      },
    };

    if (stateCharacter) {
      return {
        ...stateCharacter,
        type: 'PC', // Ensure type remains 'PC'
        data: {
          ...stateCharacter.data,
          nonWeaponProficiencies: updatedProficiencies || stateCharacter.data.nonWeaponProficiencies,
          equipment: updatedEquipment || stateCharacter.data.equipment,
          restingSite: stateCharacter.data.restingSite || '',
          currency: updatedCurrency || stateCharacter.data?.currency || defaultCharacter.data.currency,
          gridSize: updatedGridSize || stateCharacter.data?.gridSize || defaultCharacter.data.gridSize,
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
        type: 'PC', // Hardcoded to 'PC'
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
    <div className="min-h-screen p-6 relative">
      <div className={`bg-darkfantasy-primary border-[#8a7b5e] border-2 rounded-lg shadow-lg p-6 max-w-4xl mx-auto ${character.data.status === 'deceased' ? 'blur-sm' : ''}`}>
        <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6 text-center">
          {character.id ? 'Player Character Sheet' : 'Create Player Character'}
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        {loading && (
          <p className="text-darkfantasy-neutral text-sm mb-4 text-center">Loading...</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={character.data.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Race
                </label>
                <select
                  name="race"
                  value={character.data.race}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Class
                </label>
                <select
                  name="class"
                  value={character.data.class}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Alignment
                </label>
                <select
                  name="alignment"
                  value={character.data.alignment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  {alignments.map((align) => (
                    <option key={align} value={align}>
                      {align}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Age Stage
                </label>
                <select
                  name="ageStage"
                  value={character.data.ageStage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  {ageStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Level
                </label>
                <input
                  type="number"
                  name="level"
                  value={character.data.level}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  XP
                </label>
                <input
                  type="number"
                  name="xp"
                  value={character.data.xp}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">
              Ability Scores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(character.data.abilityScores).map((score) => (
                <div key={score}>
                  <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                    {score.charAt(0).toUpperCase() + score.slice(1)}
                  </label>
                  <input
                    type="number"
                    name={score}
                    value={character.data.abilityScores[score]}
                    onChange={(e) => handleChange(e, 'abilityScores', score)}
                    min="3"
                    max="18"
                    className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Languages and Proficiencies */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">
              Languages and Proficiencies
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Languages (Common is mandatory)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.languages.map((lang) => (
                    <span
                      key={lang}
                      className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                        lang === 'Common'
                          ? 'bg-darkfantasy-secondary text-darkfantasy-neutral'
                          : 'bg-darkfantasy-tertiary text-darkfantasy-neutral cursor-pointer'
                      }`}
                      onClick={() => lang !== 'Common' && removeLanguage(lang)}
                    >
                      {lang}
                      {lang !== 'Common' && (
                        <span className="ml-1 text-red-500">×</span>
                      )}
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleLanguageChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Add Language</option>
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
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Non-Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.nonWeaponProficiencies.map((prof) => (
                    <span
                      key={prof.name}
                      className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm"
                    >
                      {formatProficiency(prof.name)} ({prof.value}%)
                    </span>
                  ))}
                </div>
                <Link
                  to="/characters/new/non-weapon-proficiencies"
                  state={{ character, imagePreview }}
                  className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#661318] font-darkfantasy"
                >
                  Manage Non-Weapon Proficiencies
                </Link>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.weaponProficiencies.map((prof) => (
                    <span
                      key={prof}
                      className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm cursor-pointer"
                      onClick={() => removeWeaponProficiency(prof)}
                    >
                      {formatProficiency(prof)}
                      <span className="ml-1 text-red-500">×</span>
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleWeaponProficiencyChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Add Weapon Proficiency</option>
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
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">
              Health, Combat Stats, and Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Hit Points
                </label>
                <input
                  type="number"
                  name="hitPoints"
                  value={character.data.hitPoints}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Current HP
                </label>
                <input
                  type="number"
                  name="currentHP"
                  value={character.data.currentHP}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Bonus to Hit
                </label>
                <input
                  type="number"
                  name="bonusToHit"
                  value={character.data.bonusToHit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Bonus to Save
                </label>
                <input
                  type="number"
                  name="bonusToSave"
                  value={character.data.bonusToSave}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Equipped Armor
                </label>
                <input
                  type="text"
                  name="equippedArmor"
                  value={character.data.equippedArmor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral Rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Equipped Shield
                </label>
                <input
                  type="text"
                  name="equippedShield"
                  value={character.data.equippedShield}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Inventory
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.equipment.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                {character.id ? (
                  <Link
                    to="/characters/new/inventory"
                    state={{ character, imagePreview }}
                    className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#661318] font-darkfantasy"
                  >
                    Manage Inventory
                  </Link>
                ) : (
                  <span className="text-darkfantasy-neutral text-sm">
                    Save character to manage inventory
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">
              Description
            </h2>
            <div className="space-y-4 flex flex-col items-center">
              <div>
                <label htmlFor="profile-image" className="cursor-pointer">
                  <div className="w-50 h-50 rounded-full bg-darkfantasy-tertiary border border-darkfantasy flex items-center justify-center overflow-hidden">
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
                />
                {imageError && (
                  <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}
              </div>
              <textarea
                name="description"
                value={character.data.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none h-32"
                placeholder="Describe your character..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#661318] font-darkfantasy disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Character'}
            </button>
          </div>
        </form>
      </div>

      {/* DECEASED Overlay */}
      {character.data.status === 'deceased' && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-[#8a7b5e] rounded-lg p-8 max-w-md w-full text-center">
            <h1 className="text-5xl font-darkfantasy text-[#661318] mb-4 tracking-wider">DECEASED</h1>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Death Description
                </label>
                <textarea
                  name="deathDescription"
                  value={character.data.deathDescription}
                  onChange={handleDeathFieldChange}
                  className="w-full px-3 py-2 text-darkfantasy-neutral rounded border border-[#8a7b5e] focus:outline-none h-24"
                  placeholder="Describe the circumstances of their demise..."
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Resting Site
                </label>
                <input
                  type="text"
                  name="restingSite"
                  value={character.data.restingSite}
                  onChange={handleDeathFieldChange}
                  className="w-full px-3 py-2 text-darkfantasy-neutral rounded border border-[#8a7b5e] focus:outline-none"
                  placeholder="Where their remains lie..."
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/characters')}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#661318] font-darkfantasy"
              >
                Go Back
              </button>
              <button
                onClick={() => setReviveDialogOpen(true)}
                className="bg-[#661318] text-darkfantasy-neutral py-2 px-6 rounded hover:bg-red-800 font-darkfantasy"
              >
                Revive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revive Confirmation Dialog */}
      {reviveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-[#8a7b5e] rounded-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Defy the Veil of Death
            </h2>
            <p className="text-darkfantasy-neutral mb-6">
              Are you sure you want to bring {character.data.name} back from the dead? Tampering with life and death may unleash dire consequences, as the balance of mortal affairs is not to be trifled with.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setReviveDialogOpen(false)}
                className="bg-darkfantasy-tertiary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-gray-600 font-darkfantasy"
              >
                Cancel
              </button>
              <button
                onClick={handleRevive}
                className="bg-[#661318] text-darkfantasy-neutral py-2 px-6 rounded hover:bg-red-800 font-darkfantasy"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSheet;