'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  BarChart3,
  School
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/streams', label: 'Class Streams', icon: School },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/scores', label: 'Enter Scores', icon: FileText },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/results', label: 'Results', icon: GraduationCap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">IKONEX Academy</h1>
        <p className="text-sm text-gray-400 mt-1">Student Management System</p>
      </div>
      
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-gray-800">
        <p className="text-xs text-gray-400 text-center">IKONEX SYSTEMS © 2026</p>
      </div>
    </div>
  );
}