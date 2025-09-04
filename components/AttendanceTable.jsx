'use client';
import { useState } from 'react';

export default function AttendanceTable({ sessionId, locked, records }) {
  const [data, setData] = useState(records);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [isLocked, setIsLocked] = useState(locked);

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
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: data.map((r) => ({ studentId: r.studentId, status: r.status })),
      }),
    });
  }

  async function toggleLock() {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [], locked: !isLocked }),
    });
    setIsLocked(!isLocked);
  }

  function rowClass(status) {
    return status === 'PRESENT' ? 'table-row-present' : 'table-row-absent';
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => markAll('PRESENT')}
          className="bg-green-500 text-white px-2 py-1 rounded"
          type="button"
        >
          Mark All Present
        </button>
        <button
          onClick={() => markAll('ABSENT')}
          className="bg-red-500 text-white px-2 py-1 rounded"
          type="button"
        >
          Mark All Absent
        </button>
        <button onClick={undo} className="px-2 py-1 border rounded" type="button">
          Undo
        </button>
        <input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-1 flex-grow"
        />
        <button onClick={save} className="bg-blue-500 text-white px-4 py-1 rounded" type="button">
          Save
        </button>
        <button onClick={toggleLock} className="px-2 py-1 border rounded" type="button">
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
        <a href={`/api/sessions/${sessionId}/export`} className="px-2 py-1 border rounded">
          Export CSV
        </a>
      </div>
      {isLocked && <div className="p-2 bg-yellow-100 mb-2">Session is locked</div>}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left">Enrollment</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.studentId} className={`border-t ${rowClass(r.status)}`}>
                <td className="p-2">{r.enrollmentNumber}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">
                  <label className="mr-2">
                    <input
                      type="radio"
                      name={`status-${r.studentId}`}
                      value="PRESENT"
                      disabled={isLocked}
                      checked={r.status === 'PRESENT'}
                      onChange={() => updateStatus(r.studentId, 'PRESENT')}
                    />{' '}
                    Present
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`status-${r.studentId}`}
                      value="ABSENT"
                      disabled={isLocked}
                      checked={r.status === 'ABSENT'}
                      onChange={() => updateStatus(r.studentId, 'ABSENT')}
                    />{' '}
                    Absent
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
