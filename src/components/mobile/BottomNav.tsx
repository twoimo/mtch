import React from 'react';
import { Briefcase, Calendar, BookmarkCheck, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  bookmarkCount: number;
  consoleCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  bookmarkCount,
  consoleCount
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 safe-bottom shadow-md">
      <div className="flex items-center justify-around py-2">
        <Button 
          variant="ghost" 
          className={cn(
            "flex-col rounded-none h-14 py-1 px-3 gap-1 transition-colors duration-200 flex-1",
            activeTab === "jobs" ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
          onClick={() => onTabChange("jobs")}
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-[10px] font-medium">채용정보</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn(
            "flex-col rounded-none h-14 py-1 px-3 gap-1 transition-colors duration-200 flex-1",
            activeTab === "calendar" ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
          onClick={() => onTabChange("calendar")}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] font-medium">캘린더</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn(
            "flex-col rounded-none h-14 py-1 px-3 gap-1 transition-colors duration-200 flex-1",
            activeTab === "bookmarks" ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
          onClick={() => onTabChange("bookmarks")}
        >
          <div className="relative">
            <BookmarkCheck className="h-5 w-5" />
            {bookmarkCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-medium">북마크</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn(
            "flex-col rounded-none h-14 py-1 px-3 gap-1 transition-colors duration-200 flex-1",
            activeTab === "console" ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
          onClick={() => onTabChange("console")}
        >
          <div className="relative">
            <Terminal className="h-5 w-5" />
            {consoleCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary">
                {consoleCount > 99 ? '99+' : consoleCount}
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-medium">콘솔</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomNav;
