
import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import CommandPalette from "./components/CommandPalette";
import { useCommandPalette } from "./hooks/useCommandPalette";
import "./styles/animations.css";
import LoadingFallback from "./components/Suspense/LoadingFallback";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// 지연 로딩을 통한 코드 스플리팅
const Index = lazy(() => import('./pages/Index'));

// 커스텀 QueryClient 구성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분 동안 데이터 신선함 유지
      gcTime: 30 * 60 * 1000, // 30분 동안 사용되지 않은 데이터 캐시 유지 (이전 cacheTime)
      refetchOnWindowFocus: false, // 창 포커스 시 자동 재조회 비활성화
      // suspense 옵션 제거 - React Query v5에서는 전역 기본값으로 설정할 수 없음
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const { isOpen, setIsOpen } = useCommandPalette();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingFallback message="페이지를 불러오는 중입니다..." />}>
                  <ErrorBoundary>
                    <Index />
                  </ErrorBoundary>
                </Suspense>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
