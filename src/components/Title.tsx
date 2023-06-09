import { ReactNode } from "react";

interface TitleProps {
  size?: number;
  children?: ReactNode;
}

export default function Title({ size = 0, children }: TitleProps) {
  const sizeClass =
    size === 4
      ? "text-[60px] h-[120px]"
      : size === 3
      ? "text-[48px] h-[96px]"
      : size === 2
      ? "text-[40px] h-[80px]"
      : size === 1
      ? "text-2xl h-[48px]"
      : "text-lg h-[32px]";

  const svgSize =
    size === 4
      ? "60px"
      : size === 3
      ? "48px"
      : size === 2
      ? "40px"
      : size === 1
      ? "24px"
      : "18px";

  return (
    <div
      className={`flex items-center justify-center text-slate-600 drop-shadow ${sizeClass}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height={svgSize}
        width={svgSize}
        className="scale-x-[-1]"
      >
        <path d="M4 10a1 1 0 01-1-1 1 1 0 011-1h8a2 2 0 002-2 2 2 0 00-2-2c-.55 0-1.05.22-1.41.59a.973.973 0 01-1.42 0c-.39-.39-.39-1.03 0-1.42C9.9 2.45 10.9 2 12 2a4 4 0 014 4 4 4 0 01-4 4H4m15 2a1 1 0 001-1 1 1 0 00-1-1c-.28 0-.53.11-.71.29a.996.996 0 01-1.41 0c-.38-.39-.38-1.02 0-1.41C17.42 8.34 18.17 8 19 8a3 3 0 013 3 3 3 0 01-3 3H5a1 1 0 01-1-1 1 1 0 011-1h14m-1 6H4a1 1 0 01-1-1 1 1 0 011-1h14a3 3 0 013 3 3 3 0 01-3 3c-.83 0-1.58-.34-2.12-.88-.38-.39-.38-1.02 0-1.41a.996.996 0 011.41 0c.18.18.43.29.71.29a1 1 0 001-1 1 1 0 00-1-1z" />
      </svg>
      <div className="mx-3 font-mono font-black">{children}</div>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height={svgSize}
        width={svgSize}
      >
        <path d="M4 10a1 1 0 01-1-1 1 1 0 011-1h8a2 2 0 002-2 2 2 0 00-2-2c-.55 0-1.05.22-1.41.59a.973.973 0 01-1.42 0c-.39-.39-.39-1.03 0-1.42C9.9 2.45 10.9 2 12 2a4 4 0 014 4 4 4 0 01-4 4H4m15 2a1 1 0 001-1 1 1 0 00-1-1c-.28 0-.53.11-.71.29a.996.996 0 01-1.41 0c-.38-.39-.38-1.02 0-1.41C17.42 8.34 18.17 8 19 8a3 3 0 013 3 3 3 0 01-3 3H5a1 1 0 01-1-1 1 1 0 011-1h14m-1 6H4a1 1 0 01-1-1 1 1 0 011-1h14a3 3 0 013 3 3 3 0 01-3 3c-.83 0-1.58-.34-2.12-.88-.38-.39-.38-1.02 0-1.41a.996.996 0 011.41 0c.18.18.43.29.71.29a1 1 0 001-1 1 1 0 00-1-1z" />
      </svg>
    </div>
  );
}
