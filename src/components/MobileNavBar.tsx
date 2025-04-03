import React from 'react';
import { cn } from '@/lib/utils';
import { Home, Briefcase, Search, Calendar, Menu, BookmarkCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { getBookmarkedJobs } from '@/utils/bookmarkUtils';

interface MobileNavBarProps {
  className?: string;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  className,
  onSearchClick,
  onMenuClick
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookmarkCount, setBookmarkCount] = React.useState(0);
  
  React.useEffect(() => {
    // 북마크 개수 업데이트
    const updateBookmarkCount = () => {
      const bookmarks = getBookmarkedJobs();
      setBookmarkCount(bookmarks.length);
    };
    
    updateBookmarkCount();
    
    // 로컬 스토리지 변경 감지
    const handleStorageChange = () => {
      updateBookmarkCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarks-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarks-changed', handleStorageChange);
    };
  }, []);
  
  // 모바일 기기가 아니면 렌더링하지 않음
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-sm z-50 safe-area-bottom",
      className
    )}>
      <div className="grid grid-cols-5 h-14 items-center">
        <NavItem 
          icon={<Home size={22} />} 
          label="홈" 
          isActive={location.pathname === '/'} 
          onClick={() => navigate('/')}
        />
        <NavItem 
          icon={<Briefcase size={22} />} 
          label="채용" 
          isActive={location.pathname === '/jobs'} 
          onClick={() => navigate('/jobs')}
        />
        <NavItem 
          icon={<Search size={22} />} 
          label="검색" 
          isActive={false}
          onClick={onSearchClick}
        />
        <NavItem 
          icon={<BookmarkCheck size={22} />} 
          label="북마크" 
          isActive={location.pathname === '/bookmarks'}
          onClick={() => navigate('/bookmarks')}
          badge={bookmarkCount > 0 ? bookmarkCount : undefined}
        />
        <NavItem 
          icon={<Menu size={22} />} 
          label="메뉴" 
          isActive={false}
          onClick={onMenuClick}
        />
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, badge }) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center w-full h-full transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
      onClick={onClick}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center p-0 rounded-full"
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </div>
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );
};

export default MobileNavBar;
