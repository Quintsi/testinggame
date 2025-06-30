import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="absolute bottom-16 right-4 z-10">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-all duration-200 hover:scale-105"
        title="Built with Bolt.new"
      >
        <img
          src="/asset/black_circle_360x360.png"
          alt="Built with Bolt.new"
          className="w-12 h-12 opacity-80 hover:opacity-100 transition-opacity duration-200"
        />
      </a>
    </div>
  );
};

export default BoltBadge;