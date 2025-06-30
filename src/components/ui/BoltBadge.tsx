import React from 'react';
import { Zap } from 'lucide-react';

const BoltBadge: React.FC = () => {
  return (
    <div className="absolute bottom-16 right-4 z-10">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 bg-black/70 hover:bg-black/80 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 group"
        title="Built with Bolt.new"
      >
        <Zap className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
        <span className="font-medium">Built with Bolt.new</span>
      </a>
    </div>
  );
};

export default BoltBadge;