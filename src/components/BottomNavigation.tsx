
import React from 'react';
import { Briefcase, LayoutDashboard, BookmarkCheck, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bookmarkCount: number;
}

const BottomNavigation = ({ activeTab, setActiveTab, bookmarkCount }: BottomNavigationProps) => {
  const navigate = useNavigate();

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    navigate('/', { state: { tab: tabValue } });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-1">
        <button
          onClick={() => handleTabChange('jobs')}
          className={`flex flex-col items-center justify-center w-1/4 p-1 ${
            activeTab === 'jobs' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Briefcase className="h-5 w-5 mb-1" />
          <span className="text-xs">채용정보</span>
        </button>
        
        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex flex-col items-center justify-center w-1/4 p-1 ${
            activeTab === 'calendar' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Calendar className="h-5 w-5 mb-1" />
          <span className="text-xs">캘린더</span>
        </button>
        
        <button
          onClick={() => handleTabChange('bookmarks')}
          className={`flex flex-col items-center justify-center w-1/4 p-1 relative ${
            activeTab === 'bookmarks' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <BookmarkCheck className="h-5 w-5 mb-1" />
          <span className="text-xs">북마크</span>
          {bookmarkCount > 0 && (
            <span className="absolute top-0 right-5 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {bookmarkCount > 9 ? '9+' : bookmarkCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center justify-center w-1/4 p-1 ${
            activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">마이페이지</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
