"use client";

import Icon from "@/components/Icon";
import { cn } from "@/utils";
import { haptic } from "@/utils/haptics";
import { useEffect } from "react";
const Error = ({ error, message, className }) => {
  useEffect(() => {
    if (error) haptic("error");
  }, [error]);

  if (!error) return null;
  return (
    <div
      className={cn(
        "flex gap-2 w-full p-1 border rounded-[6px] outline-none border-red-900 bg-red-100 text-red-900 items-center justify-start",
        className
      )}
    >
      <Icon name="question-circle" className="size-[16px] shrink-0 " fill="#82181a" />
      <span className="text-xs overflow-auto">{message}</span>
    </div>
  );
};

export default Error;
