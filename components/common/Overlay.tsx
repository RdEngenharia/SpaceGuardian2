
import React from 'react';

interface OverlayProps {
  children: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center text-center z-50 p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>
      {children}
    </div>
  );
};

export const Title: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = 'text-cyan-400' }) => {
  return (
    <h1 className={`text-4xl md:text-5xl font-bold [text-shadow:0_0_20px_#0ff] mb-5 ${className}`}>
      {children}
    </h1>
  );
};

export const MenuButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }> = ({ children, onClick, className = 'bg-cyan-400' }) => {
  return (
    <button
      onClick={onClick}
      className={`py-4 px-8 m-2 text-lg cursor-pointer border-none font-bold w-72 font-mono transition duration-200 text-black hover:bg-white hover:shadow-[0_0_15px_#0ff] ${className}`}
    >
      {children}
    </button>
  );
};

export default Overlay;
