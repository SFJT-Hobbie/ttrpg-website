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
  const [gridSize, setGridSize] = useState({
    rows: character?.data?.gridSize?.rows || 5,
    cols: character?.data?.gridSize?.cols || 5,
  });

  // Compute total size dynamically
  const TOTAL_WIDTH = gridSize.cols * CELL_SIZE + (gridSize.cols - 1) * GAP;
  const TOTAL_HEIGHT = gridSize.rows * CELL_SIZE + (gridSize.rows - 1) * GAP;

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
            // Fetch from inventory_items for existing characters
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
            // Use character.data.equipment for new characters
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

  // Handle grid size changes
  const handleGridSizeChange = (e) => {
    const { name, value } = e.target;
    const newValue = Math.min(15, Math.max(1, Number(value) || 1));
    setGridSize((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Add a new item
  const addItem = async () => {
    if (!itemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    const position = findFreeCell();
    if (!position) {
      setError(`No space left in the ${gridSize.cols}x${gridSize.rows} grid`);
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
    for (let y = 1; y <= gridSize.rows; y++) {
      for (let x = 1; x <= gridSize.cols; x++) {
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
      x + item.w - 1 > gridSize.cols ||
      y < 1 ||
      y + item.h - 1 > gridSize.rows
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

        const newW = Math.max(1, Math.min(item.w + dw, gridSize.cols - item.gridX + 1));
        const newH = Math.max(1, Math.min(item.h + dh, gridSize.rows - item.gridY + 1));

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
        gridSize,
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
        updatedGridSize: gridSize,
      },
    });
  };

  if (!character) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-darkfantasy-primary p-6 font-darkfantasy">
        <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 w-full max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold text-darkfantasy-highlight mb-6 text-center">
            Inventory Canvas
          </h1>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center text-darkfantasy-neutral">{error}</p>
          )}
          {loading && (
            <p className="text-darkfantasy-neutral text-sm mb-4 text-center">Loading...</p>
          )}

          {/* Input and Controls */}
          <div className="mb-6 space-y-4">
            <h2 className="text-xl font-bold text-darkfantasy-highlight">Manage Items</h2>
            <div className="grid grid-cols-1 gap-4">
            </div>

            {/* Currency Inputs */}
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

            {/* Grid Size Inputs */}
            <div className="flex flex-col justify-center items-center">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-bold mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onKeyPress={handleAddKeyPress}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-center gap-5">
              <button
                onClick={addItem}
                disabled={loading || !itemName.trim()}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold disabled:opacity-50"
              >
                Add Item
              </button>
              <button
                onClick={removeItem}
                disabled={loading || !selectedId}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-secondary/80 font-bold disabled:opacity-50"
              >
                Remove Selected Item
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="mb-6 flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-darkfantasy-highlight mb-4">
              Inventory Grid ({gridSize.cols}x{gridSize.rows})
            </h2>
            <div
              className={`grid grid-cols-${gridSize.cols} grid-rows-${gridSize.rows} gap-[5px] bg-darkfantasy-secondary relative`}
              style={{
                width: `${TOTAL_WIDTH}px`,
                height: `${TOTAL_HEIGHT}px`,
                minWidth: `${TOTAL_WIDTH}px`,
                minHeight: `${TOTAL_HEIGHT}px`,
                boxSizing: 'border-box',
              }}
            >
              {[...Array(gridSize.rows)].map((_, y) =>
                [...Array(gridSize.cols)].map((_, x) => (
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
          <div className="flex flex-col justify-center items-center">
            <label className="block text-darkfantasy-neutral text-sm font-bold mb-2">
              Grid Rows (1-15)
            </label>
            <input
              type="number"
              name="rows"
              value={gridSize.rows}
              onChange={handleGridSizeChange}
              min="1"
              max="15"
              className="w-24 px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight"
              disabled={loading}
            />
          </div>
          <div className="text-center mt-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-darkfantasy-secondary/80 font-bold disabled:opacity-50"
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