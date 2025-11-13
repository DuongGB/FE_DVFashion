import { useEffect } from "react";
import { createPortal } from "react-dom";

function ensureModalRoot() {
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  return root;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  backdropClass = "bg-black/60",
  containerClass = "w-[96vw] max-w-6xl h-[90vh]",
  closeOnBackdrop = true,
}) {
  const root = ensureModalRoot();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className={`absolute inset-0 ${backdropClass}`}
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      <div
        className={`relative bg-white rounded-xl shadow-2xl overflow-hidden ${containerClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    root
  );
}
