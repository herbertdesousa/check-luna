'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchValue = async () => {
    try {
      const res = await fetch('/api/increment');
      const data = await res.json();
      setValue(data.value);
    } catch (error) {
      console.error('Failed to fetch value:', error);
    }
  };

  const increment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/increment', { method: 'POST' });
      const data = await res.json();
      setValue(data.value);
    } catch (error) {
      console.error('Failed to increment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValue();
    const interval = setInterval(fetchValue, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-black dark:text-zinc-50">
          Contador Compartilhado
        </h1>
        <div className="text-6xl font-mono mb-6 text-center text-black dark:text-zinc-50">
          {value}
        </div>
        <button
          onClick={increment}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Incrementando...' : 'Incrementar'}
        </button>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 text-center">
          O valor é compartilhado entre todos os dispositivos
        </p>
      </div>
    </div>
  );
}
