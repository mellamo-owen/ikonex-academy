'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  streamId: string;
  stream?: { name: string };
  scores?: any[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [formData, setFormData] = useState({ name: '', admissionNo: '', streamId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [studentsRes, streamsRes] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/streams')
    ]);
    setStudents(await studentsRes.json());
    setStreams(await streamsRes.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingStudent ? 'PUT' : 'POST';
    
    const res = await fetch('/api/students', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingStudent ? { ...formData, id: editingStudent.id } : formData)
    });
    
    if (res.ok) {
      toast.success(editingStudent ? 'Student updated' : 'Student added');
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ name: '', admissionNo: '', streamId: '' });
      loadData();
    } else {
      const error = await res.json();
      toast.error(error.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this student? This will also delete all their scores.')) {
      await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
      toast.success('Student deleted');
      loadData();
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStream = !filterStream || student.streamId === filterStream;
    return matchesSearch && matchesStream;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student information and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setFormData({ name: '', admissionNo: '', streamId: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Register Student
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              className="w-full pl-10 p-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 border rounded-lg w-48"
            value={filterStream}
            onChange={(e) => setFilterStream(e.target.value)}
          >
            <option value="">All Streams</option>
            {streams.map(stream => (
              <option key={stream.id} value={stream.id}>{stream.name}</option>
            ))}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Admission No</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Class Stream</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{student.admissionNo}</td>
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4">{student.stream?.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStudent(student);
                          setFormData({
                            name: student.name,
                            admissionNo: student.admissionNo,
                            streamId: student.streamId
                          });
                          setShowModal(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingStudent ? 'Edit' : 'Register'} Student</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border rounded-lg mb-3"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Admission Number"
                className="w-full p-2 border rounded-lg mb-3"
                value={formData.admissionNo}
                onChange={e => setFormData({...formData, admissionNo: e.target.value})}
                required
              />
              <select
                className="w-full p-2 border rounded-lg mb-4"
                value={formData.streamId}
                onChange={e => setFormData({...formData, streamId: e.target.value})}
                required
              >
                <option value="">Select Class Stream</option>
                {streams.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingStudent ? 'Update' : 'Register'}
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
      
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Student Details</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-semibold">{selectedStudent.admissionNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class Stream</p>
                  <p className="font-semibold">{selectedStudent.stream?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="font-semibold">{selectedStudent.scores?.length || 0}</p>
                </div>
              </div>
              
              {selectedStudent.scores && selectedStudent.scores.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Performance Summary</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Subject</th>
                        <th className="p-2 text-left">CA Score</th>
                        <th className="p-2 text-left">Exam Score</th>
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.scores.map((score: any) => (
                        <tr key={score.id} className="border-t">
                          <td className="p-2">{score.subject?.name}</td>
                          <td className="p-2">{score.caScore}</td>
                          <td className="p-2">{score.examScore}</td>
                          <td className="p-2">{score.total}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              score.grade === 'A' ? 'bg-green-100 text-green-800' :
                              score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              score.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {score.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
