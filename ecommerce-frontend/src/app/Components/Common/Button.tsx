import React from "react";

interface ButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  text,
  className = "normal",
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button type={type} className={className} onClick={onClick}>
      {text}
    </button>
  );
}

export function NormalButton({
  text = "Explore More",
  onClick,
}: {
  text?: string;
  onClick?: () => void;
}) {
  return (
    <button className="normal" onClick={onClick}>
      {text}
    </button>
  );
}

export function WhiteButton({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <button className="white" onClick={onClick}>
      {text}
    </button>
  );
}
