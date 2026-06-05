"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat iframe - shown when open */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 md:bottom-20 md:left-5 z-[999] transition-all">
          <iframe
            src="https://app.primerarespuesta.net/widget?id=7pimu6bJ"
            className="w-[280px] h-[450px] md:w-[400px] md:h-[600px] rounded-xl shadow-2xl border-0"
            allow="clipboard-write"
            title="Chatbot"
          />
        </div>
      )}

      {/* Toggle button */}
      <Button
        className={`fixed! left-5 bottom-5 z-1000transition-all! max-md:left-4 max-md:bottom-4 size-9.5 ${
          isOpen ? "rotate-180" : ""
        }`}
        onClick={toggleChat}
        isPrimary
        isCircle
      >
        <Icon name={isOpen ? "close-small" : "question-circle"} />
      </Button>
    </>
  );
};

export default ChatWidget;
