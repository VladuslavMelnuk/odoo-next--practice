'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApiKey { key: string; role: string; }
interface Metric { id: number; key: string; endpoint: string; method: string; status: number; time: string; date: string; }

export default function AdminDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedRole, setSelectedRole] = useState('read-only');

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      setApiKeys(data.keys || []);
      setMetrics(data.metrics || []);
    } catch {
      console.error('Помилка завантаження даних');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const generateKey = async () => {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ role: selectedRole })
    });
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Gateway Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Генерація та Активні Ключі</h2>
            
            <div className="flex gap-4 mb-6">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="read-only">Read-Only (Тільки GET)</option>
                <option value="admin">Admin (Повний доступ)</option>
              </select>
              <button 
                onClick={generateKey}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + ЗГЕНЕРУВАТИ
              </button>
            </div>

            <ul className="space-y-3">
              {apiKeys.map((k, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                  <span className="font-mono text-gray-700">{k.key}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${k.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {k.role.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold w-full mb-4">Загальне навантаження</h2>
            <div className="text-5xl font-bold text-blue-600 mb-2">{metrics.length}</div>
            <p className="text-gray-500">Всього збережених запитів (логів)</p>
            <div className="mt-4 flex gap-4 w-full">
              <div className="flex-1 bg-green-50 p-4 rounded-lg text-center">
                <div className="text-green-600 font-bold text-xl">
                  {metrics.length > 0 ? Math.round((metrics.filter(m => m.status === 200).length / metrics.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">Успішних</div>
              </div>
              <div className="flex-1 bg-red-50 p-4 rounded-lg text-center">
                <div className="text-red-600 font-bold text-xl">
                  {metrics.length > 0 ? Math.round((metrics.filter(m => m.status !== 200).length / metrics.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">Помилок</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Live Метрики (JSON-файл)</h2>
            <span className="flex items-center gap-2 text-sm text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Оновлюється автоматично
            </span>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-gray-600 text-sm">
                  <th className="p-4 border-b">Час</th>
                  <th className="p-4 border-b">API Ключ</th>
                  <th className="p-4 border-b">Метод</th>
                  <th className="p-4 border-b">Ендпоінт</th>
                  <th className="p-4 border-b">Статус</th>
                  <th className="p-4 border-b">Тривалість</th>
                </tr>
              </thead>
              <tbody>
                {metrics.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Запитів ще не було. Зроби запит через Postman!</td></tr>
                ) : metrics.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500">{m.date}</td>
                    <td className="p-4 font-mono text-sm">{m.key}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${m.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {m.method}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{m.endpoint}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono">{m.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
