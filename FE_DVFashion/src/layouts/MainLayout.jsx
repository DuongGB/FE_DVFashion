import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { ArrowUp } from "react-feather";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top button */}
      <button
        className="bg-blue-600 text-white rounded-full p-3 mb-2 shadow-lg hover:bg-blue-700 transition cursor-pointer fixed bottom-4 left-4 z-50"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
}
