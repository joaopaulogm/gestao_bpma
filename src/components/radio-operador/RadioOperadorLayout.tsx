import React from 'react';

interface RadioOperadorLayoutProps {
  children: React.ReactNode;
}

export default function RadioOperadorLayout({ children }: RadioOperadorLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-gray-50/50">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
