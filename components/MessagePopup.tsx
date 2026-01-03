
import React from 'react';

interface MessagePopupProps {
  message: string;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ message }) => {
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white [text-shadow:0_0_10px_#0ff,0_0_20px_#0ff] text-2xl md:text-3xl font-bold text-center z-50 pointer-events-none animate-messageAnim">
      {message}
      <style>{`
        @keyframes messageAnim {
          0% { opacity: 0; transform: translate(-50%, -40%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -60%) scale(1.2); }
        }
        .animate-messageAnim {
          animation: messageAnim 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MessagePopup;
