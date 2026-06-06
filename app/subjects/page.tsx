'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subjectsRes, streamsRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch('/api/streams')
    ]);
    setSubjects(await subjectsRes.json());
    setStreams(await streamsRes.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSubject ? 'PUT' : 'POST';

    const res = await fetch('/api/subjects', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingSubject ? { ...formData, id: editingSubject.id } : formData)
    });

    if (res.ok) {
      toast.success(editingSubject ? 'Subject updated' : 'Subject added');
      setShowModal(false);
      setEditingSubject(null);
      setFormData({ name: '', code: '' });
      loadData();
    } else {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subject?')) {
      await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
      toast.success('Subject deleted');
      loadData();
    }
  };

  const handleAssignStreams = async () => {
    const res = await fetch('/api/stream-subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: selectedSubject?.id,
        streamIds: selectedStreams
      })
    });

    if (res.ok) {
      toast.success('Subjects assigned to streams');
      setShowAssignModal(false);
      setSelectedSubject(null);
      setSelectedStreams([]);
    } else {
      toast.error('Failed to assign subjects');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">Manage school subjects and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            setFormData({ name: '', code: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubject(subject);
                      setShowAssignModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubject(subject);
                      setFormData({ name: subject.name, code: subject.code });
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingSubject ? 'Edit' : 'Add'} Subject</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Subject Name"
                className="w-full p-2 border rounded-lg mb-3"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Subject Code"
                className="w-full p-2 border rounded-lg mb-4"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingSubject ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign {selectedSubject.name} to Streams</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-auto">
              {streams.map(stream => (
                <label key={stream.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStreams.includes(stream.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStreams([...selectedStreams, stream.id]);
                      } else {
                        setSelectedStreams(selectedStreams.filter(id => id !== stream.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>{stream.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAssignStreams}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Assign
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
