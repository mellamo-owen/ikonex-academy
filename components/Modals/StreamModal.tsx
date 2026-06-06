'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  stream?: any;
}

export default function StreamModal({ isOpen, onClose, onSave, stream }: StreamModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (stream) {
      setName(stream.name);
    } else {
      setName('');
    }
  }, [stream]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{stream ? 'Edit' : 'Add'} Class Stream</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Stream Name *</label>
            <input
              type="text"
              placeholder="e.g., Form 1A"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              {stream ? 'Update' : 'Create'}
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