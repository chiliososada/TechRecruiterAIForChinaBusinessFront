
import React from 'react';
import { cn } from "@/lib/utils";

// Root component props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Root component
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className="mx-auto flex w-full justify-center"
    >
      <div className="flex flex-row items-center gap-1">
        {/* Previous button */}
        <PaginationPrevious 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
        />
        
        {/* Page numbers and ellipsis */}
        <PaginationContent>
          {generatePaginationRange(currentPage, totalPages).map((item, index) => {
            if (item === 'ellipsis') {
              return <PaginationEllipsis key={`ellipsis-${index}`} />;
            }
            
            return (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={currentPage === item}
                  onClick={() => onPageChange(Number(item))}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </PaginationContent>
        
        {/* Next button */}
        <PaginationNext
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
        />
      </div>
    </nav>
  );
};

// Helper function to generate pagination range with ellipsis
export const generatePaginationRange = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  if (current <= 3) {
    return [1, 2, 3, 4, 'ellipsis', total - 1, total];
  }
  
  if (current >= total - 2) {
    return [1, 2, 'ellipsis', total - 3, total - 2, total - 1, total];
  }
  
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
};

// Pagination content component
export const PaginationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
));
PaginationContent.displayName = "PaginationContent";

// Pagination item component
export const PaginationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

// Pagination link component
export const PaginationLink = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-md border text-center text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "bg-background",
      className
    )}
    {...props}
  />
));
PaginationLink.displayName = "PaginationLink";

// Pagination previous component
export const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Go to previous page"
    className={cn("gap-1 pl-2.5 hover:bg-muted rounded-md px-3 py-2", props.disabled ? "pointer-events-none opacity-50" : "", className)}
    {...props}
  >
    <span className="sr-only">Previous</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    <span>前へ</span>
  </button>
));
PaginationPrevious.displayName = "PaginationPrevious";

// Pagination next component
export const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Go to next page"
    className={cn("gap-1 pr-2.5 hover:bg-muted rounded-md px-3 py-2", props.disabled ? "pointer-events-none opacity-50" : "", className)}
    {...props}
  >
    <span>次へ</span>
    <span className="sr-only">Next</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  </button>
));
PaginationNext.displayName = "PaginationNext";

// Pagination ellipsis component
export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 12h.01M12 12h.01M21 12h.01" />
    </svg>
    <span className="sr-only">More pages</span>
  </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

// Default export for convenience
export default Pagination;
