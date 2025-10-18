import React from 'react';
import * as LucideReact from 'lucide-react';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg">
      <LucideReact.LoaderCircle className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
      <p className="text-lg font-semibold text-slate-300">{text}</p>
    </div>
  );
};

export default Loader;