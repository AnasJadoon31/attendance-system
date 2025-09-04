'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportForm({ rosterId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', or 'info'
  const router = useRouter();

  const handleImport = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('file');

    // Clear previous messages
    setMessage('');
    setMessageType('');

    // Validate file selection
    if (!file || file.size === 0) {
      setMessage('❌ Please select a file to import');
      setMessageType('error');
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidFile) {
      setMessage('❌ Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
      setMessageType('error');
      return;
    }

    setIsUploading(true);
    setMessage('🔄 Uploading and processing file...');
    setMessageType('info');

    try {
      const response = await fetch(`/api/rosters/${rosterId}/import`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let result;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error(`Invalid response from server. Status: ${response.status}`);
      }

      console.log('Parsed result:', result);

      if (response.ok && result.success) {
        const successMessage = `✅ ${result.message}
📊 Import Statistics:
• Total rows processed: ${result.totalRows}
• Valid student records: ${result.validRows}
• Unique students found: ${result.uniqueStudents}
• Successfully imported: ${result.studentsImported}${result.errors && result.errors.length > 0 ? 
            `\n⚠️ Errors encountered: ${result.errors.length}` : ''}`;

        setMessage(successMessage);
        setMessageType('success');

        // Reset form
        e.target.reset();

        // Refresh the page to show new students
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        const errorMessage = result?.error || `Import failed with status ${response.status}`;
        setMessage(`❌ Import failed: ${errorMessage}`);
        setMessageType('error');
        console.error('Import failed:', result);
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage(`❌ Network error: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
        Import Students
      </h2>

      <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400 file:font-medium hover:file:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
            disabled={isUploading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isUploading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Importing...
            </div>
          ) : (
            '📤 Import Students'
          )}
        </button>
        <a
          href={`/api/rosters/${rosterId}/export`}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
        >
          📊 Export CSV
        </a>
      </form>

      {message && (
        <div className={`p-4 rounded-xl whitespace-pre-line border backdrop-blur-sm transition-all duration-300 ${
          messageType === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : messageType === 'error'
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <span className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded mr-3 flex items-center justify-center">
            <span className="text-xs">ℹ️</span>
          </span>
          Import Instructions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Supported formats: CSV (.csv), Excel (.xlsx, .xls)</span>
            </div>
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Required columns: <strong className="text-cyan-400">Enrollment Number</strong> and <strong className="text-cyan-400">Name</strong></span>
            </div>
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Enrollment columns: enrollmentNumber, enrollment, roll, student_id, ID</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Name columns: name, studentName, fullName</span>
            </div>
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Or separate: firstName, lastName (will be combined)</span>
            </div>
            <div className="flex items-start">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              <span>Additional columns saved as extra information</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
