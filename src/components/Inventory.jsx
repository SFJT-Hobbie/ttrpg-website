import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../AuthContext';
import api from '../api';

const CELL_SIZE = 100; // Pixels
const GAP = 5; // Pixels
const ItemTypes = { ITEM: 'item' };
const FIXED_COLS = 5; // Fixed number of columns

function InventoryGrid() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { character, imagePreview } = location.state || {};

  // Initialize state
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState({
    gold: character?.data?.currency?.gold || 0,
    silver: character?.data?.currency?.silver || 0,
    copper: character?.data?.currency?.copper || 0,
  });
  const [gridRows, setGridRows] = useState(character?.data?.gridSize?.rows || 5);

  // Compute total size dynamically
  const TOTAL_WIDTH = FIXED_COLS * CELL_SIZE + (FIXED_COLS - 1) * GAP;
  const TOTAL_HEIGHT = gridRows * CELL_SIZE + (gridRows - 1) * GAP;

  // Redirect if no character or user
  useEffect(() => {
    if (!user) {
      setError('You must be logged in to manage inventory');
      navigate('/login');
      return;
    }
    if (!character) {
      setError('No character selected');
      navigate(character?.type === 'NPC' ? '/characters/new/npc' : '/characters/new/pc');
    }
  }, [user, character, navigate]);

  // Initialize or fetch inventory items
  useEffect(() => {
    if (character) {
      const initializeItems = async () => {
        setLoading(true);
        try {
          let initialItems = [];
          if (character.id) {
            const fetchedItems = await api.getInventoryItems(character.id);
            initialItems = fetchedItems.map((item) => ({
              id: item.id,
              name: item.name,
              gridX: item.slot_position?.gridX ?? 1,
              gridY: item.slot_position?.gridY ?? 1,
              w: item.slot_position?.w ?? 1,
              h: item.slot_position?.h ?? 1,
              character_id: item.character_id,
            }));
          } else {
            initialItems = (character.data?.equipment || []).map((item) => ({
              id: item.id,
              name: item.name,
              gridX: item.slot_position?.gridX ?? 1,
              gridY: item.slot_position?.gridY ?? 1,
              w: item.slot_position?.w ?? 1,
              h: item.slot_position?.h ?? 1,
              character_id: character.id,
            }));
          }
          console.log('Initialized items:', initialItems);
          setItems(initialItems);
        } catch (err) {
          setError('Failed to load inventory items: ' + err.message);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      initializeItems();
    }
  }, [character]);

  // Handle currency input changes
  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setCurrency((prev) => ({
      ...prev,
      [name]: Math.max(0, Number(value) || 0),
    }));
  };

  // Handle grid rows change
  const handleGridRowsChange = (e) => {
    const newValue = Math.min(15, Math.max(1, Number(e.target.value) || 1));
    setGridRows(newValue);
  };

  // Add a new item
  const addItem = async () => {
    if (!itemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    const position = findFreeCell();
    if (!position) {
      setError(`No space left in the ${FIXED_COLS}x${gridRows} grid`);
      return;
    }

    const newItem = {
      id: uuidv4(),
      name: itemName.trim(),
      gridX: position.x,
      gridY: position.y,
      w: 1,
      h: 1,
      character_id: character?.id,
    };

    setLoading(true);
    try {
      if (character.id) {
        await api.upsertInventoryItem({
          id: newItem.id,
          character_id: newItem.character_id,
          name: newItem.name,
          slot_position: {
            gridX: newItem.gridX,
            gridY: newItem.gridY,
            w: newItem.w,
            h: newItem.h,
          },
        });
      }
      setItems((prev) => [...prev, newItem]);
      setItemName('');
      setError(null);
    } catch (err) {
      setError(
        err.message.includes('row-level security')
          ? 'You are not authorized to add this item'
          : err.message || 'Failed to add item'
      );
      console.error('Add item error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove selected item
  const removeItem = async () => {
    if (!selectedId) {
      setError('Please select an item to remove');
      return;
    }

    setLoading(true);
    try {
      if (character.id) {
        await api.deleteInventoryItem(selectedId);
      }
      setItems((prev) => prev.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find first free 1x1 cell
  const findFreeCell = () => {
    for (let y = 1; y <= gridRows; y++) {
      for (let x = 1; x <= FIXED_COLS; x++) {
        const taken = items.some(
          (item) =>
            item.gridX <= x &&
            x < item.gridX + item.w &&
            item.gridY <= y &&
            y < item.gridY + item.h
        );
        if (!taken) {
          return { x, y };
        }
      }
    }
    return null;
  };

  // Handle drag drop
  const handleDrop = async (itemId, x, y) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Validate position
    if (
      x < 1 ||
      x + item.w - 1 > FIXED_COLS ||
      y < 1 ||
      y + item.h - 1 > gridRows
    ) {
      return;
    }

    // Check for overlaps
    for (let dy = y; dy < y + item.h; dy++) {
      for (let dx = x; dx < x + item.w; dx++) {
        const taken = items.some(
          (other) =>
            other.id !== itemId &&
            other.gridX <= dx &&
            dx < other.gridX + other.w &&
            other.gridY <= dy &&
            dy < other.gridY + other.h
        );
        if (taken) return;
      }
    }

    setLoading(true);
    try {
      const updatedItem = { ...item, gridX: x, gridY: y };
      if (character.id) {
        await api.upsertInventoryItem({
          id: updatedItem.id,
          character_id: updatedItem.character_id,
          name: updatedItem.name,
          slot_position: {
            gridX: updatedItem.gridX,
            gridY: updatedItem.gridY,
            w: updatedItem.w,
            h: updatedItem.h,
          },
        });
      }
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? updatedItem : i))
      );
    } catch (err) {
      setError(err.message || 'Failed to update item position');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resize item
  const resizeItem = async (id, dw, dh) => {
    setLoading(true);
    try {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;

        const newW = Math.max(1, Math.min(item.w + dw, FIXED_COLS - item.gridX + 1));
        const newH = Math.max(1, Math.min(item.h + dh, gridRows - item.gridY + 1));

        // Check for overlaps
        for (let y = item.gridY; y < item.gridY + newH; y++) {
          for (let x = item.gridX; x < item.gridX + newW; x++) {
            const taken = prev.some(
              (other) =>
                other.id !== id &&
                other.gridX <= x &&
                x < other.gridX + other.w &&
                other.gridY <= y &&
                y < other.gridY + other.h
            );
            if (taken) return prev;
          }
        }

        const updatedItem = { ...item, w: newW, h: newH };
        if (character.id) {
          api.upsertInventoryItem({
            id: updatedItem.id,
            character_id: updatedItem.character_id,
            name: updatedItem.name,
            slot_position: {
              gridX: updatedItem.gridX,
              gridY: updatedItem.gridY,
              w: updatedItem.w,
              h: updatedItem.h,
            },
          });
        }
        return prev.map((i) => (i.id === id ? updatedItem : i));
      });
    } catch (err) {
      setError(err.message || 'Failed to resize item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start editing name
  const startEditing = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  // Save edited name
  const saveName = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      setEditName('');
      return;
    }

    setLoading(true);
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const updatedItem = { ...item, name: editName.trim() };
      if (character.id) {
        await api.upsertInventoryItem({
          id: updatedItem.id,
          character_id: updatedItem.character_id,
          name: updatedItem.name,
          slot_position: {
            gridX: updatedItem.gridX,
            gridY: updatedItem.gridY,
            w: updatedItem.w,
            h: updatedItem.h,
          },
        });
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? updatedItem : i))
      );
      setEditingId(null);
      setEditName('');
    } catch (err) {
      setError(err.message || 'Failed to rename item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for adding item
  const handleAddKeyPress = (e) => {
    if (e.key === 'Enter') addItem();
  };

  // Navigate back to CharacterSheet or NPCSheet
  const handleBack = () => {
    const updatedCharacter = {
      ...character,
      data: {
        ...character.data,
        equipment: items.map((item) => ({
          id: item.id,
          name: item.name,
          slot_position: {
            gridX: item.gridX,
            gridY: item.gridY,
            w: item.w,
            h: item.h,
          },
        })),
        currency,
        gridSize: { rows: gridRows, cols: FIXED_COLS },
      },
    };
    console.log('Navigating back with character:', updatedCharacter);
    const targetPath = character.type === 'NPC' ? '/characters/new/npc' : '/characters/new/pc';
    navigate(targetPath, {
      state: {
        character: updatedCharacter,
        imagePreview,
        updatedEquipment: updatedCharacter.data.equipment,
        updatedCurrency: currency,
        updatedGridSize: { rows: gridRows, cols: FIXED_COLS },
      },
    });
  };

  if (!character) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
        <div className="darkfantasy-tertiary rounded-lg shadow-darkfantasy p-8 w-full max-w-[800px] mx-auto border-darkfantasy-heavy">
          <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent mb-8 text-center tracking-tight">
            Vault of Relics
          </h1>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center text-darkfantasy-neutral">{error}</p>
          )}
          {loading && (
            <p className="text-darkfantasy-neutral text-sm mb-4 text-center">Loading...</p>
          )}

          {/* Input and Controls */}
          <div className="mb-6 space-y-4">
            <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-highlight tracking-tight">Manage Items</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onKeyDown={handleAddKeyPress}
                  placeholder="Enter item name"
                  className="w-72 px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Grid Rows (1-15)
                </label>
                <input
                  type="number"
                  value={gridRows}
                  onChange={handleGridRowsChange}
                  min="1"
                  max="15"
                  className="w-24 px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex justify-start space-x-4">
              <button
                onClick={addItem}
                disabled={loading || !itemName.trim()}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded-lg border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
              <button
                onClick={removeItem}
                disabled={loading || !selectedId}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded-lg border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Selected Item
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-darkfantasy-highlight mb-4">
              Inventory Grid ({FIXED_COLS}x{gridRows})
            </h2>
            <div
              className={`grid grid-cols-5 grid-rows-${gridRows} gap-[5px] bg-darkfantasy-secondary relative overflow-hidden`} // Static grid-cols-5
              style={{
                width: `${TOTAL_WIDTH}px`,
                height: `${TOTAL_HEIGHT}px`,
                minWidth: `${TOTAL_WIDTH}px`,
                minHeight: `${TOTAL_HEIGHT}px`,
                boxSizing: 'border-box',
                // Temporary inline style for debugging
                display: 'grid',
                gridTemplateColumns: `repeat(${FIXED_COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE}px)`,
                gap: `${GAP}px`,
              }}
            >
              {[...Array(gridRows)].map((_, y) =>
                [...Array(FIXED_COLS)].map((_, x) => (
                  <InventoryCell
                    key={`cell-${x}-${y}`}
                    x={x + 1}
                    y={y + 1}
                    items={items}
                    onDrop={handleDrop}
                  />
                ))
              )}
              {items.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                  onResize={resizeItem}
                  onDoubleClick={() => startEditing(item.id, item.name)}
                  isEditing={editingId === item.id}
                  editName={editName}
                  setEditName={setEditName}
                  saveName={() => saveName(item.id)}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Currency Inputs */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-darkfantasy-highlight mb-4">Hoard of Coin</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-bold mb-2">
                  Gold
                </label>
                <input
                  type="number"
                  name="gold"
                  value={currency.gold}
                  onChange={handleCurrencyChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-bold mb-2">
                  Silver
                </label>
                <input
                  type="number"
                  name="silver"
                  value={currency.silver}
                  onChange={handleCurrencyChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-bold mb-2">
                  Copper
                </label>
                <input
                  type="number"
                  name="copper"
                  value={currency.copper}
                  onChange={handleCurrencyChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={handleBack}
              disabled={loading}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded-lg border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Character Sheet
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

function InventoryCell({ x, y, items, onDrop }) {
  const [, drop] = useDrop({
    accept: ItemTypes.ITEM,
    drop: (draggedItem) => onDrop(draggedItem.id, x, y),
  });

  return (
    <div
      ref={drop}
      className="w-[100px] h-[100px] bg-darkfantasy-primary border border-darkfantasy-primary"
      style={{ boxSizing: 'border-box' }}
    />
  );
}

function InventoryItem({
  item,
  isSelected,
  onSelect,
  onResize,
  onDoubleClick,
  isEditing,
  editName,
  setEditName,
  saveName,
  disabled,
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled,
  });

  // Ensure valid position and size
  const gridX = item.gridX ?? 1;
  const gridY = item.gridY ?? 1;
  const w = Math.max(1, item.w ?? 1);
  const h = Math.max(1, item.h ?? 1);

  const cellTotal = CELL_SIZE + GAP; // 105px
  const x = (gridX - 1) * cellTotal;
  const y = (gridY - 1) * cellTotal;
  const width = w * CELL_SIZE + (w - 1) * GAP;
  const height = h * CELL_SIZE + (h - 1) * GAP;

  return (
    <div
      ref={drag}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        minWidth: '50px',
        minHeight: '50px',
        boxSizing: 'border-box',
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`absolute bg-darkfantasy-highlight text-darkfantasy-neutral font-darkfantasy flex items-center justify-center cursor-move border ${
        isSelected ? 'border-yellow-400' : 'border-darkfantasy-primary'
      } shadow-darkfantasy`}
    >
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && saveName()}
          onBlur={saveName}
          className="w-full h-full text-sm text-center bg-darkfantasy-primary text-darkfantasy-neutral font-darkfantasy px-2"
          autoFocus
          disabled={disabled}
        />
      ) : (
        <div className="relative bg-black w-full h-full flex items-center justify-center">
          <span className="text-sm font-bold text-center px-2 truncate">
            {item.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResize(item.id, 1, 0);
            }}
            className="absolute bottom-1 right-1 text-xs bg-darkfantasy-secondary hover:bg-darkfantasy-secondary/80 text-darkfantasy-neutral px-1 rounded"
            disabled={disabled}
          >
            ➔
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResize(item.id, 0, 1);
            }}
            className="absolute bottom-1 left-1 text-xs bg-darkfantasy-secondary hover:bg-darkfantasy-secondary/80 text-darkfantasy-neutral px-1 rounded"
            disabled={disabled}
          >
            ↓
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResize(item.id, -1, 0);
            }}
            className="absolute top-1 left-1 text-xs bg-darkfantasy-secondary hover:bg-darkfantasy-secondary/80 text-darkfantasy-neutral px-1 rounded"
            disabled={disabled}
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResize(item.id, 0, -1);
            }}
            className="absolute top-1 right-1 text-xs bg-darkfantasy-secondary hover:bg-darkfantasy-secondary/80 text-darkfantasy-neutral px-1 rounded"
            disabled={disabled}
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
}

export default InventoryGrid;