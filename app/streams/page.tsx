'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Stream {
  id: string;
  name: string;
  _count?: { students: number };
}

export default function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [streamName, setStreamName] = useState('');
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    const res = await fetch('/api/streams');
    const data = await res.json();
    setStreams(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/streams';
    const method = editingStream ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingStream?.id, name: streamName })
    });
    
    if (res.ok) {
      toast.success(editingStream ? 'Stream updated' : 'Stream created');
      setShowModal(false);
      setEditingStream(null);
      setStreamName('');
      loadStreams();
    } else {
      const error = await res.json();
      toast.error(error.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this stream? This will also delete all students in this stream.')) {
      const res = await fetch(`/api/streams?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Stream deleted');
        loadStreams();
      } else {
        toast.error('Failed to delete stream');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Streams</h1>
          <p className="text-gray-600 mt-1">Manage class streams and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingStream(null);
            setStreamName('');
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Add Stream
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{stream.name}</h3>
                  <p className="text-gray-600 mt-1">{stream._count?.students || 0} Students</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStream(stream);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingStream(stream);
                      setStreamName(stream.name);
                      setShowModal(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(stream.id)}
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
              <h2 className="text-xl font-bold">{editingStream ? 'Edit' : 'Add'} Class Stream</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Stream Name (e.g., Form 1A)"
                className="w-full p-2 border rounded-lg mb-4"
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingStream ? 'Update' : 'Create'}
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
      
      {selectedStream && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedStream.name} - Details</h2>
              <button onClick={() => setSelectedStream(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="font-semibold">Stream Information</p>
                <p>Total Students: {selectedStream._count?.students || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
