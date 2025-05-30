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
    <div className="bg-darkfantasy-tertiary shadow-darkfantasy border-darkfantasy rounded-lg p-6 flex flex-col items-center space-y-4 min-h-[200px] texture-darkfantasy">
      <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight">Marching Order</h3>
      <select
        value={selectedLine}
        onChange={(e) => setSelectedLine(e.target.value)}
        className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm font-darkfantasy"
        aria-label="Select marching order line position"
      >
        <option value="" disabled>Select line position</option>
        {lineOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="text-darkfantasy-neutral text-lg font-darkfantasy font-medium flex-grow flex items-center justify-center">
        {savedLine ? (
          <span className="text-darkfantasy-highlight">
            {savedLine}
            {savedLine === '1' ? 'st' : savedLine === '2' ? 'nd' : savedLine === '3' ? 'rd' : 'th'} Line
          </span>
        ) : (
          'No line position set'
        )}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={saveLine}
          disabled={!selectedLine}
          className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight ${
            !selectedLine ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Save marching order"
        >
          <SaveIcon className="w-5 h-5 mr-2 text-darkfantasy-highlight" />
          Save
        </button>
        <button
          onClick={clearLine}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow font-darkfantasy font-medium flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Clear marching order"
        >
          <TrashIcon className="w-5 h-5 mr-2 text-darkfantasy-highlight" />
          Clear
        </button>
      </div>
    </div>
  );
}

export default MarchingOrder;