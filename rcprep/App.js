import React, { useState, useEffect } from 'react';
import './styles.css';

const coreItems = [
  { id: 1, text: 'Used Microsoft Copilot for documentation', status: 'neutral', coachTip: 'Focus on how you validated the AI output for technical accuracy.' },
  { id: 2, text: 'Prompt engineering for technical writing', status: 'neutral', coachTip: 'Be ready to describe a complex prompt you used for tone consistency.' },
  { id: 3, text: 'API Documentation (Swagger/OpenAPI)', status: 'neutral', coachTip: 'Explain your process for documenting endpoints and error codes.' },
  { id: 4, text: 'Docs-as-Code Workflows', status: 'neutral', coachTip: 'Discuss Git-based version control for documentation updates.' },
  { id: 5, text: 'Structured Authoring (DITA XML)', status: 'neutral', coachTip: 'Mention content reuse and multi-channel publishing benefits.' }
];

export default function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('rcprep-data');
    return saved ? JSON.parse(saved) : coreItems;
  });
  const [newVal, setNewVal] = useState('');

  useEffect(() => {
    localStorage.setItem('rcprep-data', JSON.stringify(items));
  }, [items]);

  const toggleStatus = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const next = item.status === 'neutral' ? 'in-progress' : item.status === 'in-progress' ? 'completed' : 'neutral';
        return { ...item, status: next };
      }
      return item;
    }));
  };

  const addItem = () => {
    const customCount = items.filter(i => i.isCustom).length;
    if (customCount < 4 && newVal.trim()) {
      const newItem = { id: Date.now(), text: newVal, status: 'neutral', coachTip: 'Self-defined goal.', isCustom: true };
      setItems([...items, newItem]);
      setNewVal('');
    }
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500">Rapid Circle Prep Engine</h1>
        <div className="mt-4 flex gap-2">
          <input 
            value={newVal} 
            onChange={(e) => setNewVal(e.target.value)} 
            placeholder="Add custom goal..."
            className="bg-gray-900 border border-gray-700 p-2 rounded flex-grow text-sm"
          />
          <button 
            onClick={addItem} 
            disabled={items.filter(i => i.isCustom).length >= 4}
            className="bg-yellow-600 px-4 rounded text-sm disabled:opacity-50"
          >Add ({4 - items.filter(i => i.isCustom).length} left)</button>
        </div>
      </header>
      
      <div className="space-y-4">
        {items.map(item => (
          <div 
            key={item.id} 
            onClick={() => toggleStatus(item.id)}
            className={`p-5 rounded-lg cursor-pointer transition-all duration-300 status-${item.status}`}
          >
            <div className="checklist-item-text text-lg">{item.text}</div>
            <div className="text-sm italic text-yellow-500/80 mt-2">💡 Coach Tip: {item.coachTip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}