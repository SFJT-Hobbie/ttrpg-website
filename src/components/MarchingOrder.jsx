import React, { useState } from 'react';
import { SaveIcon, TrashIcon } from 'lucide-react';

function MarchingOrder() {
  const [selectedLine, setSelectedLine] = useState('');
  const [savedLine, setSavedLine] = useState('');

  const lineOptions = Array.from({ length: 10 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Line`,
  }));

  const saveLine = () => {
    setSavedLine(selectedLine);
  };

  const clearLine = () => {
    setSelectedLine('');
    setSavedLine('');
  };

  return (
    <div className="bg-darkfantasy-tertiary rounded-lg shadow-darkfantasy p-6 flex flex-col items-center space-y-4 min-h-[200px] h-full">
      <h3 className="text-xl font-bold text-darkfantasy-highlight">Marching Order</h3>
      <select
        value={selectedLine}
        onChange={(e) => setSelectedLine(e.target.value)}
        className="w-full px-2 py-1 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-primary focus:outline-none focus:border-darkfantasy-highlight text-sm"
      >
        <option value="" disabled>Select line position</option>
        {lineOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex space-x-4">
        <button
          onClick={saveLine}
          disabled={!selectedLine}
          className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded font-bold flex items-center ${
            !selectedLine ? 'opacity-50 cursor-not-allowed' : 'hover:bg-darkfantasy-secondary/80'
          }`}
        >
          <SaveIcon className="w-5 h-5 mr-2" />
          Save
        </button>
        <button
          onClick={clearLine}
          className="bg-red-800 text-darkfantasy-neutral py-2 px-4 rounded hover:bg-red-900 font-bold flex items-center"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          Clear
        </button>
      </div>
      <div className="text-darkfantasy-neutral text-lg font-bold font-darkfantasy flex-grow flex items-center justify-center">
        {savedLine ? `${savedLine}${savedLine === '1' ? 'st' : savedLine === '2' ? 'nd' : savedLine === '3' ? 'rd' : 'th'} Line` : 'No line position set'}
      </div>
    </div>
  );
}

export default MarchingOrder;