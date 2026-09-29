/**
 * Pagination Component
 * Handles pagination for large datasets (30,000+ teams)
 */

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize, 
  onPageChange,
  maxVisiblePages = 5 
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pages = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>
          Showing {startItem} to {endItem} of {totalItems.toLocaleString()} teams
        </span>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          type="button"
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <div className="pagination-pages">
          {pages[0] > 1 && (
            <>
              <button
                className="pagination-page"
                onClick={() => onPageChange(1)}
                type="button"
              >
                1
              </button>
              {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              className={`pagination-page ${page === currentPage ? 'pagination-page--active' : ''}`}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button
                className="pagination-page"
                onClick={() => onPageChange(totalPages)}
                type="button"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          type="button"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      <div className="pagination-size">
        <label htmlFor="pageSize">Teams per page:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageChange(1, parseInt(e.target.value))}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
}
