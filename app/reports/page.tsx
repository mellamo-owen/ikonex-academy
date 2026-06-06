'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Users, BookOpen, Filter, TrendingUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportSummary, setReportSummary] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadReportSummary();
  }, []);

  useEffect(() => {
    if (selectedStream) {
      fetch(`/api/students?streamId=${selectedStream}`)
        .then(r => r.json())
        .then(setStudents);
    }
  }, [selectedStream]);

  const loadData = async () => {
    const [studentsRes, streamsRes] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/streams')
    ]);
    setStudents(await studentsRes.json());
    setStreams(await streamsRes.json());
  };

  const loadReportSummary = async () => {
    const res = await fetch('/api/reports');
    const data = await res.json();
    setReportSummary(data);
  };

  const generateIndividualReport = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    
    setGenerating(true);
    window.open(`/api/reports/${selectedStudent}`, '_blank');
    setTimeout(() => setGenerating(false), 1000);
  };

  const generateClassReport = async () => {
    if (!selectedStream) {
      toast.error('Please select a class stream');
      return;
    }
    
    setGenerating(true);
    
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId: selectedStream, type: 'class' })
    });
    
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `class_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Class report generated');
    } else {
      toast.error('Failed to generate report');
    }
    
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate PDF report cards and performance reports</p>
      </div>

      {/* Report Summary Cards */}
      {reportSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Students</p>
                <p className="text-2xl font-bold mt-2">{reportSummary.totalStudents}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Class Streams</p>
                <p className="text-2xl font-bold mt-2">{reportSummary.totalStreams}</p>
              </div>
              <BookOpen className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Performance</p>
                <p className="text-2xl font-bold mt-2">{reportSummary.averagePerformance?.toFixed(2)}%</p>
              </div>
              <TrendingUp className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Top Performer</p>
                <p className="text-lg font-bold mt-2 truncate">{reportSummary.topPerformers?.[0]?.name || '-'}</p>
              </div>
              <Award className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold">Individual Report Card</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Student</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Choose a student...</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.admissionNo}) - {student.stream?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={generateIndividualReport}
              disabled={generating || !selectedStudent}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Download size={20} />
              {generating ? 'Generating...' : 'Generate Report Card'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold">Class Performance Report</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Class Stream</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
              >
                <option value="">Choose a class...</option>
                {streams.map((stream: any) => (
                  <option key={stream.id} value={stream.id}>{stream.name}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={generateClassReport}
              disabled={generating || !selectedStream}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Download size={20} />
              {generating ? 'Generating...' : 'Generate Class Report'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Top Performers Table */}
      {reportSummary?.topPerformers && reportSummary.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold p-6 pb-0">Top 10 Performers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Admission No</th>
                  <th className="px-6 py-3 text-left">Student Name</th>
                  <th className="px-6 py-3 text-left">Class Stream</th>
                  <th className="px-6 py-3 text-left">Average Score</th>
                </tr>
              </thead>
              <tbody>
                {reportSummary.topPerformers.map((student: any, index: number) => (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">{student.admissionNo}</td>
                    <td className="px-6 py-4 font-medium">{student.name}</td>
                    <td className="px-6 py-4">{student.stream || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">{student.average.toFixed(2)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stream Performance Summary */}
      {reportSummary?.streams && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-bold p-6 pb-0">Stream Performance Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Stream Name</th>
                  <th className="px-6 py-3 text-left">Total Students</th>
                  <th className="px-6 py-3 text-left">Average Score</th>
                  <th className="px-6 py-3 text-left">Performance</th>
                </tr>
              </thead>
              <tbody>
                {reportSummary.streams.map((stream: any) => (
                  <tr key={stream.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{stream.name}</td>
                    <td className="px-6 py-4">{stream.studentCount}</td>
                    <td className="px-6 py-4">{stream.averageScore.toFixed(2)}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${stream.averageScore}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{stream.averageScore.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}