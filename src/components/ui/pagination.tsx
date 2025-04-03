import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <ul
      ref={ref}
      className={cn(
        "flex flex-row items-center",
        isMobile ? "gap-0.5" : "gap-1", // Tighter spacing on mobile
        className
      )}
      {...props}
    />
  )
})
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// 모바일 특화 페이지네이션 컴포넌트 추가
const MobilePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}) => {
  const isMobile = useIsMobile();
  
  // 범위 생성 함수
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  // 페이지 번호와 안내 표시 생성 로직
  const paginationItems = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 3; // 양쪽 sibling + 현재 페이지 + 처음/마지막

    // 전체 페이지가 표시할 수 있는 것보다 적은 경우
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, "...", totalPages];
    }
    
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, "...", ...rightRange];
    }
    
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, "...", ...middleRange, "...", totalPages];
    }
    
    return [];
  }, [currentPage, totalPages, siblingCount]);
  
  return (
    <div className={cn("flex justify-center items-center space-x-1", className)}>
      <Button
        variant="outline"
        size="icon"
        className={cn("h-8 w-8", isMobile && "h-9 w-9")}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>
      
      {paginationItems.map((item, index) => {
        if (item === "...") {
          return (
            <span 
              key={`ellipsis-${index}`} 
              className="px-2 py-1 text-gray-500"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">더 많은 페이지</span>
            </span>
          );
        }
        
        return (
          <Button
            key={index}
            variant={currentPage === item ? "default" : "outline"}
            size="icon"
            className={cn("h-8 w-8", isMobile && "h-9 w-9")}
            onClick={() => onPageChange(item as number)}
          >
            {item}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        className={cn("h-8 w-8", isMobile && "h-9 w-9")}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </div>
  );
};

export {
  MobilePagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
