import { ReactNode } from "react";

interface TitleProps {
  children?: ReactNode;
}

export default function Title({ children }: TitleProps) {
  return (
    <div className="flex items-center justify-center drop-shadow">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height="20px"
        width="20px"
        className="scale-x-[-1]"
      >
        <path d="M4 10a1 1 0 01-1-1 1 1 0 011-1h8a2 2 0 002-2 2 2 0 00-2-2c-.55 0-1.05.22-1.41.59a.973.973 0 01-1.42 0c-.39-.39-.39-1.03 0-1.42C9.9 2.45 10.9 2 12 2a4 4 0 014 4 4 4 0 01-4 4H4m15 2a1 1 0 001-1 1 1 0 00-1-1c-.28 0-.53.11-.71.29a.996.996 0 01-1.41 0c-.38-.39-.38-1.02 0-1.41C17.42 8.34 18.17 8 19 8a3 3 0 013 3 3 3 0 01-3 3H5a1 1 0 01-1-1 1 1 0 011-1h14m-1 6H4a1 1 0 01-1-1 1 1 0 011-1h14a3 3 0 013 3 3 3 0 01-3 3c-.83 0-1.58-.34-2.12-.88-.38-.39-.38-1.02 0-1.41a.996.996 0 011.41 0c.18.18.43.29.71.29a1 1 0 001-1 1 1 0 00-1-1z" />
      </svg>
      {/* <hr className="ml-4 h-1 flex-1 rounded bg-slate-500"></hr> */}
      <div className="mx-3 font-mono text-xl font-black">{children}</div>
      {/* <hr className="mr-4 h-1 flex-1 rounded bg-slate-500"></hr> */}
      <svg viewBox="0 0 24 24" fill="currentColor" height="20px" width="20px">
        <path d="M4 10a1 1 0 01-1-1 1 1 0 011-1h8a2 2 0 002-2 2 2 0 00-2-2c-.55 0-1.05.22-1.41.59a.973.973 0 01-1.42 0c-.39-.39-.39-1.03 0-1.42C9.9 2.45 10.9 2 12 2a4 4 0 014 4 4 4 0 01-4 4H4m15 2a1 1 0 001-1 1 1 0 00-1-1c-.28 0-.53.11-.71.29a.996.996 0 01-1.41 0c-.38-.39-.38-1.02 0-1.41C17.42 8.34 18.17 8 19 8a3 3 0 013 3 3 3 0 01-3 3H5a1 1 0 01-1-1 1 1 0 011-1h14m-1 6H4a1 1 0 01-1-1 1 1 0 011-1h14a3 3 0 013 3 3 3 0 01-3 3c-.83 0-1.58-.34-2.12-.88-.38-.39-.38-1.02 0-1.41a.996.996 0 011.41 0c.18.18.43.29.71.29a1 1 0 001-1 1 1 0 00-1-1z" />
      </svg>
    </div>
  );
}
