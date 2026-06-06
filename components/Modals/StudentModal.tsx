'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  student?: any;
  streams: any[];
}

export default function StudentModal({ isOpen, onClose, onSave, student, streams }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    admissionNo: '',
    streamId: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        admissionNo: student.admissionNo,
        streamId: student.streamId
      });
    } else {
      setFormData({ name: '', admissionNo: '', streamId: '' });
    }
  }, [student]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{student ? 'Edit' : 'Add'} Student</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Admission Number *</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.admissionNo}
              onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Class Stream *</label>
            <select
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.streamId}
              onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
              required
            >
              <option value="">Select Stream</option>
              {streams.map((stream) => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              {student ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}