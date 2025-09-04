'use client';
import { useState } from 'react';

export default function AttendanceTable({ sessionId, locked, records }) {
  const [data, setData] = useState(records);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [isLocked, setIsLocked] = useState(locked);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const filtered = data.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.enrollmentNumber.toLowerCase().includes(query.toLowerCase())
  );

  function updateStatus(id, status) {
    setHistory([...history, data]);
    setData(data.map((r) => (r.studentId === id ? { ...r, status } : r)));
  }

  function markAll(status) {
    setHistory([...history, data]);
    setData(data.map((r) => ({ ...r, status })));
  }

  function undo() {
    const prev = history.pop();
    if (prev) {
      setData(prev);
      setHistory([...history]);
    }
  }

  async function save() {
    setIsSaving(true);
    setSaveMessage('');
    setMessageType('');

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: data.map((r) => ({ studentId: r.studentId, status: r.status })),
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSaveMessage('✅ Attendance saved successfully!');
        setMessageType('success');
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
          setMessageType('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage(`❌ Failed to save: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleLock() {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [], locked: !isLocked }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setIsLocked(!isLocked);
        setSaveMessage(`✅ Session ${!isLocked ? 'locked' : 'unlocked'} successfully!`);
        setMessageType('success');
        setTimeout(() => {
          setSaveMessage('');
          setMessageType('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to toggle lock');
      }
    } catch (error) {
      console.error('Lock toggle error:', error);
      setSaveMessage(`❌ Failed to ${!isLocked ? 'lock' : 'unlock'}: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  }

  function rowClass(status) {
    return status === 'PRESENT'
      ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
      : 'bg-red-500/10 border-l-4 border-red-500';
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Controls Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={() => markAll('PRESENT')}
            disabled={isLocked || isSaving}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            type="button"
          >
            ✅ Mark All Present
          </button>

          <button
            onClick={() => markAll('ABSENT')}
            disabled={isLocked || isSaving}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            type="button"
          >
            ❌ Mark All Absent
          </button>

          <button
            onClick={undo}
            disabled={history.length === 0 || isLocked || isSaving}
            className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-slate-300 rounded-lg hover:bg-slate-600/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            ↶ Undo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
          />

          <button
            onClick={save}
            disabled={isLocked || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            type="button"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              '💾 Save Attendance'
            )}
          </button>

          <button
            onClick={toggleLock}
            disabled={isSaving}
            className={`px-4 py-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isLocked 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-400' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-400'
            }`}
            type="button"
          >
            {isLocked ? '🔓 Unlock Session' : '🔒 Lock Session'}
          </button>

          <a
            href={`/api/sessions/${sessionId}/export`}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
          >
            📊 Export CSV
          </a>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            messageType === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>

      {/* Lock Status */}
      {isLocked && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl mb-6 flex items-center">
          <span className="text-2xl mr-3">🔒</span>
          <div>
            <p className="font-semibold">Session is locked</p>
            <p className="text-sm text-yellow-300">Attendance changes are disabled. Unlock to make modifications.</p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
            Attendance ({filtered.length} students)
          </h2>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/30">
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-cyan-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map((r, index) => (
                <tr
                  key={r.studentId}
                  className={`group hover:bg-slate-700/20 transition-all duration-300 ${rowClass(r.status)}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <span className="text-white font-mono">{r.enrollmentNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                    {r.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${r.studentId}`}
                          value="PRESENT"
                          disabled={isLocked}
                          checked={r.status === 'PRESENT'}
                          onChange={() => updateStatus(r.studentId, 'PRESENT')}
                          className="sr-only"
                        />
                        <div className={`flex items-center px-3 py-1 rounded-lg border transition-all duration-300 ${
                          r.status === 'PRESENT' 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:bg-slate-600/30'
                        }`}>
                          <span className="mr-2">✅</span>
                          Present
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`status-${r.studentId}`}
                          value="ABSENT"
                          disabled={isLocked}
                          checked={r.status === 'ABSENT'}
                          onChange={() => updateStatus(r.studentId, 'ABSENT')}
                          className="sr-only"
                        />
                        <div className={`flex items-center px-3 py-1 rounded-lg border transition-all duration-300 ${
                          r.status === 'ABSENT' 
                            ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:bg-slate-600/30'
                        }`}>
                          <span className="mr-2">❌</span>
                          Absent
                        </div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
