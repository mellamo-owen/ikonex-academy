'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Award, BarChart3, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function ResultsPage() {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);

  useEffect(() => {
    fetch('/api/streams').then(r => r.json()).then(setStreams);
    fetch('/api/subjects').then(r => r.json()).then(setSubjects);
  }, []);

  useEffect(() => {
    if (selectedStream) {
      loadStreamData();
    }
  }, [selectedStream]);

  const loadStreamData = async () => {
    try {
      const [studentsRes, scoresRes] = await Promise.all([
        fetch(`/api/students?streamId=${selectedStream}`),
        fetch('/api/scores')
      ]);
      
      const studentsData = await studentsRes.json();
      const scoresData = await scoresRes.json();
      
      setStudents(studentsData);
      setScores(scoresData);
      
      // Calculate rankings
      const rankedStudents = studentsData.map((student: any) => {
        const studentScores = scoresData.filter((s: any) => s.studentId === student.id);
        const total = studentScores.reduce((sum: number, s: any) => sum + s.total, 0);
        const average = studentScores.length > 0 ? total / studentScores.length : 0;
        return { ...student, total, average };
      }).sort((a: any, b: any) => b.total - a.total);
      
      setRankings(rankedStudents);
      
      // Calculate subject performance
      const subjectPerf = subjects.map((subject: any) => {
        const subjectScores = scoresData.filter((s: any) => s.subjectId === subject.id);
        const avg = subjectScores.length > 0 
          ? subjectScores.reduce((sum: number, s: any) => sum + s.total, 0) / subjectScores.length 
          : 0;
        const passCount = subjectScores.filter((s: any) => s.grade !== 'F').length;
        const passRate = subjectScores.length > 0 ? (passCount / subjectScores.length) * 100 : 0;
        return { name: subject.name, average: avg, passRate };
      });
      
      setSubjectPerformance(subjectPerf);
    } catch (error) {
      toast.error('Failed to load results');
    }
  };

  const gradeDistribution = [
    { name: 'A', count: rankings.filter((r: any) => r.average >= 80).length, color: '#10B981' },
    { name: 'B', count: rankings.filter((r: any) => r.average >= 70 && r.average < 80).length, color: '#3B82F6' },
    { name: 'C', count: rankings.filter((r: any) => r.average >= 60 && r.average < 70).length, color: '#F59E0B' },
    { name: 'D', count: rankings.filter((r: any) => r.average >= 50 && r.average < 60).length, color: '#F97316' },
    { name: 'E', count: rankings.filter((r: any) => r.average >= 40 && r.average < 50).length, color: '#EF4444' },
    { name: 'F', count: rankings.filter((r: any) => r.average < 40).length, color: '#8B5CF6' },
  ];

  const totalStudents = rankings.length;
  const classAverage = rankings.reduce((sum: number, r: any) => sum + r.average, 0) / totalStudents || 0;
  const topPerformer = rankings[0];
  const passCount = rankings.filter((r: any) => r.average >= 40).length;
  const passRate = (passCount / totalStudents) * 100 || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results Processing</h1>
        <p className="text-gray-600 mt-1">View rankings, performance analytics, and class positions</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Select Class Stream</label>
        <select
          className="w-full md:w-96 p-2 border rounded-lg"
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
        >
          <option value="">Choose a class stream...</option>
          {streams.map((stream: any) => (
            <option key={stream.id} value={stream.id}>{stream.name}</option>
          ))}
        </select>
      </div>
      
      {selectedStream && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-3xl font-bold mt-2">{totalStudents}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Class Average</p>
                  <p className="text-3xl font-bold mt-2">{classAverage.toFixed(2)}%</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pass Rate</p>
                  <p className="text-3xl font-bold mt-2">{passRate.toFixed(2)}%</p>
                </div>
                <Award className="text-yellow-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Top Performer</p>
                  <p className="text-lg font-bold mt-2 truncate">{topPerformer?.name || '-'}</p>
                </div>
                <BarChart3 className="text-purple-500" size={32} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Subject Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#3B82F6" name="Average Score" />
                  <Bar dataKey="passRate" fill="#10B981" name="Pass Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-bold p-6 pb-0">Student Rankings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Rank</th>
                    <th className="px-6 py-3 text-left">Admission No</th>
                    <th className="px-6 py-3 text-left">Student Name</th>
                    <th className="px-6 py-3 text-left">Total Marks</th>
                    <th className="px-6 py-3 text-left">Average</th>
                    <th className="px-6 py-3 text-left">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((student: any, index: number) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">{student.admissionNo}</td>
                      <td className="px-6 py-4 font-medium">{student.name}</td>
                      <td className="px-6 py-4">{student.total}</td>
                      <td className="px-6 py-4">{student.average.toFixed(2)}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
