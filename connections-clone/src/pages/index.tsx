import { useEffect, useState } from 'react';
import { puzzle } from '../data/puzzle';

type GroupKey = 'Yellow' | 'Green' | 'Blue' | 'Purple';

const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<{ [key in GroupKey]?: string[] }>({});
  const [strikes, setStrikes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setWords(shuffle(puzzle.words));
  }, []);

  const handleSelect = (word: string) => {
    if (selected.includes(word) || Object.values(solvedGroups).flat().includes(word)) return;
    setSelected(prev => prev.length < 4 ? [...prev, word] : prev);
  };

  const handleSubmit = () => {
    if (selected.length !== 4) return;

    let found = false;
    for (const key of Object.keys(puzzle.groups) as GroupKey[]) {
      const group = puzzle.groups[key].words;
      if (selected.every(w => group.includes(w))) {
        setSolvedGroups(prev => ({ ...prev, [key]: group }));
        setWords(prev => prev.filter(w => !group.includes(w)));
        setMessage(`✅ ${puzzle.groups[key].label}`);
        found = true;
        break;
      }
    }

    if (!found) {
      const matchCounts = Object.values(puzzle.groups).map(group => 
        selected.filter(w => group.words.includes(w)).length
      );
      const isOneAway = matchCounts.some(count => count === 3);
      setStrikes(prev => prev + 1);
      setMessage(isOneAway ? 'One away!' : 'Try again!');
    }

    setSelected([]);
  };

  const handleRestart = () => {
    setWords(shuffle(puzzle.words));
    setSelected([]);
    setSolvedGroups({});
    setStrikes(0);
    setMessage(null);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5f5] font-sans">
      <h1 className="text-3xl font-bold mb-4">Connections</h1>
      <div className="grid grid-cols-4 gap-2 w-full max-w-md">
        {words.map(word => (
          <button
            key={word}
            onClick={() => handleSelect(word)}
            className={\`p-2 border rounded text-sm font-medium transition
              \${selected.includes(word) ? 'bg-yellow-200' : 'bg-white'}
              \${Object.values(solvedGroups).flat().includes(word) ? 'opacity-50 cursor-default' : ''}
            \`}
            disabled={Object.values(solvedGroups).flat().includes(word)}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button onClick={handleSubmit} className="px-4 py-2 bg-black text-white rounded">Submit</button>
      </div>

      {message && <div className="mt-2 text-lg font-semibold">{message}</div>}

      <div className="mt-4 text-sm text-gray-600">Strikes: {strikes} / 4</div>

      {Object.entries(solvedGroups).map(([key, group]) => (
        <div key={key} className="mt-2 text-sm text-green-700 font-medium">
          {puzzle.groups[key as GroupKey].label}: {group.join(', ')}
        </div>
      ))}

      {(Object.keys(solvedGroups).length === 4 || strikes >= 4) && (
        <button onClick={handleRestart} className="mt-6 px-4 py-2 bg-gray-800 text-white rounded">Play Again</button>
      )}

      <footer className="mt-10 text-xs text-gray-500">Made by Neeraj's Crew</footer>
    </main>
  );
}