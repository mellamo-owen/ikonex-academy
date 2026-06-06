'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    streams: 0,
    subjects: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, streamsRes, subjectsRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/streams'),
          fetch('/api/subjects')
        ]);
        const students = await studentsRes.json();
        const streams = await streamsRes.json();
        const subjects = await subjectsRes.json();
        setStats({
          students: students.length,
          streams: streams.length,
          subjects: subjects.length,
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { title: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { title: 'Class Streams', value: stats.streams, icon: GraduationCap, color: 'bg-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'bg-purple-500' },
    { title: 'System Ready', value: 'Active', icon: Trophy, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-full text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}