export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxPagesToShow = 7; // Số nút trang tối đa hiển thị
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Luôn hiển thị trang đầu, cuối, và các trang gần currentPage
      const left = Math.max(2, currentPage - 2);
      const right = Math.min(totalPages - 1, currentPage + 2);

      pages.push(1);
      if (left > 2) pages.push("left-ellipsis");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("right-ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt;
      </button>
      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={page}
            className={`px-3 py-1 rounded ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ) : (
          <span key={page + idx} className="px-2 text-gray-500 select-none">
            ...
          </span>
        )
      )}
      <button
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &gt;
      </button>
    </div>
  );
}
