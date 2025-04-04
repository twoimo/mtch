
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Github, Sun, Moon, Command, ToggleRight } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Icons } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HamburgerMenuProps {
  autoFetchEnabled: boolean;
  toggleAutoFetch: () => void;
  triggerCommandPalette: () => void;
}

const HamburgerMenu = ({ 
  autoFetchEnabled, 
  toggleAutoFetch,
  triggerCommandPalette 
}: HamburgerMenuProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px]">
        <div className="flex flex-col h-full">
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-2 px-2">설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted">
                <div className="flex items-center">
                  <ToggleRight className="mr-2 h-4 w-4" />
                  <Label htmlFor="auto-fetch" className="text-sm">
                    자동 조회
                  </Label>
                </div>
                <Switch
                  id="auto-fetch"
                  checked={autoFetchEnabled}
                  onCheckedChange={toggleAutoFetch}
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={triggerCommandPalette}
              >
                <Command className="mr-2 h-4 w-4" />
                명령어 팔레트
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+K</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === 'dark' ? '라이트 모드' : '다크 모드'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                asChild
              >
                <a href="https://github.com/twoimo" target="_blank" rel="noopener noreferrer">
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                  GitHub 방문하기
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-auto pb-8 px-2">
            <p className="text-xs text-muted-foreground">
              © 2023 채용 정보 대시보드 - 모든 권리 보유
            </p>
            <div className="flex flex-col mt-2 space-y-1">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">이용약관</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">개인정보처리방침</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">도움말</a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;
