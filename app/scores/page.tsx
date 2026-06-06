'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScoresPage() {
  const [streams, setStreams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examScore, setExamScore] = useState('');
  const [caScore, setCaScore] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(2026);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedStream) {
      fetch(`/api/students?streamId=${selectedStream}`)
        .then(r => r.json())
        .then(setStudents);
    }
  }, [selectedStream]);

  const loadInitialData = async () => {
    const [streamsRes, subjectsRes] = await Promise.all([
      fetch('/api/streams'),
      fetch('/api/subjects')
    ]);
    setStreams(await streamsRes.json());
    setSubjects(await subjectsRes.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedSubject || !examScore || !caScore) {
      toast.error('Please fill all fields');
      return;
    }

    const exam = parseInt(examScore, 10);
    const ca = parseInt(caScore, 10);

    if (exam < 0 || exam > 100 || ca < 0 || ca > 100) {
      toast.error('Scores must be between 0 and 100');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: selectedStudent,
        subjectId: selectedSubject,
        examScore: exam,
        caScore: ca,
        term,
        year
      })
    });

    if (res.status === 409) {
      toast.error('Duplicate score entry! This student already has a score for this subject this term.');
    } else if (res.ok) {
      toast.success('Score saved successfully');
      setExamScore('');
      setCaScore('');
      setSelectedStudent('');
      setSelectedSubject('');
    } else {
      toast.error('Failed to save score');
    }

    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enter Student Scores</h1>
        <p className="text-gray-600 mt-1">Record examination and continuous assessment scores</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Class Stream *</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                required
              >
                <option value="">Select Stream</option>
                {streams.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Student *</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedStream}
                required
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Exam Score (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={examScore}
                  onChange={(e) => setExamScore(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CA Score (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={caScore}
                  onChange={(e) => setCaScore(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Duplicate Prevention:</p>
                <p>The system automatically prevents duplicate score entries. Each student can only have one score per subject per term.</p>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={20} />
                Save Score
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5" size={20} />
          <div className="text-sm text-green-800">
            <p className="font-semibold">Auto-calculation Features:</p>
            <p>• Total marks are automatically calculated (Exam + CA)</p>
            <p>• Grades are assigned based on configured grading scale</p>
            <p>• Subject positions are automatically updated within class streams</p>
          </div>
        </div>
      </div>
    </div>
  );
}
