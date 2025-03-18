'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  pagesToShow: number;
  onPageChange?: (page: number) => void; // ✅ Optional function
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  pagesToShow,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [inputValue, setInputValue] = useState<number>(currentPage);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setInputValue(currentPage); // Sync input field with current page
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    if (onPageChange) {
      onPageChange(page); // ✅ Call the function if passed
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const generatePageNumbers = () => {
    if (totalPages <= pagesToShow)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    const half = Math.floor(pagesToShow / 2);

    pages.push(1); // Always show first page

    const start = Math.max(2, currentPage - half);
    const end = Math.min(totalPages - 1, currentPage + half);

    if (start > 2) pages.push('...');

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages - 1) pages.push('...');

    pages.push(totalPages); // Always show last page

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="mt-6 flex justify-center items-center">
      {totalPages === 1 ? (
        // ✅ Show only Page 1 when there's only 1 page
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-uwuRed text-white font-bold rounded-md">
            1
          </button>
        </div>
      ) : isMobile ? (
        // 📱 Mobile Pagination: [1] < [input] Go > [Last]
        <div>
          <div className="flex justify-center mb-4">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              onKeyDown={(e) =>
                e.key === 'Enter' && handlePageChange(inputValue)
              }
              className="w-24 px-2 py-1 text-black rounded-l-md text-center"
              min={1}
              max={totalPages}
            />

            <button
              onClick={() => handlePageChange(inputValue)}
              className="px-3 py-1 bg-uwuRed text-white rounded-r-md bg-uwu-red"
            >
              Go
            </button>
          </div>

          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-white transition ${
                currentPage === 1 ? 'hidden' : 'block'
              }`}
            >
              &lt;
            </button>

            {pageNumbers.map((page, index) =>
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`px-1 py-1 rounded-md transition ${
                    currentPage === page
                      ? 'text-white font-bold'
                      : 'text-gray-300'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-1 py-1 text-gray-400">
                  {page}
                </span>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-white transition ${
                currentPage === totalPages ? 'hidden' : 'block'
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      ) : (
        // 💻 Desktop Pagination: < 1 ... 5 6 [7] 8 9 ... 20 >
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-white transition ${
              currentPage === 1 ? 'hidden' : 'block'
            }`}
          >
            &lt;
          </button>

          {pageNumbers.map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                className={`px-1 py-1 rounded-md transition ${
                  currentPage === page
                    ? 'text-white font-bold'
                    : 'text-gray-300'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-1 py-1 text-gray-400">
                {page}
              </span>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-white transition ${
              currentPage === totalPages ? 'hidden' : 'block'
            }`}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
