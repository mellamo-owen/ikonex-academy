'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, streams: 0, subjects: 0 });

  useEffect(() => {
    async function load() {
      const [students, streams, subjects] = await Promise.all([
        fetch('/api/students').then(r => r.json()),
        fetch('/api/streams').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json())
      ]);
      setStats({ students: students.length, streams: streams.length, subjects: subjects.length });
    }
    load();
  }, []);

  const cards = [
    { title: 'Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { title: 'Streams', value: stats.streams, icon: GraduationCap, color: 'bg-green-500' },
    { title: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Active', value: 'Ready', icon: Trophy, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
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