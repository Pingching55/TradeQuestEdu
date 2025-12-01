import React from 'react';
import { AppTab } from '../types';
import { BookOpen, BarChart2, MessageSquare } from 'lucide-react';

interface TabBarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.LEARN, label: 'Learn', icon: BookOpen },
    { id: AppTab.JOURNAL, label: 'Journal', icon: BarChart2 },
    { id: AppTab.MENTOR, label: 'AI Mentor', icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-slate-700 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full space-y-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;