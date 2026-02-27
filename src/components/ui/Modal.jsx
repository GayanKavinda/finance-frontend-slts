/**
 * Professional centered modal component with rounded corners and shadow
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback when modal closes
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 * @param {boolean} props.showClose - Show close button (default: true)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
  showClose = true,
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex-shrink-0 px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {subtitle && (
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">
                    {subtitle}
                  </p>
                )}
                {title && (
                  <h2
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h2>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
