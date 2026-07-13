import React from 'react';

const Skeleton = ({ type = 'text', count = 1 }) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'title': return 'skeleton skeleton-title';
      case 'rect': return 'skeleton skeleton-rect';
      case 'circle': return 'skeleton skeleton-circle';
      default: return 'skeleton skeleton-text';
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={getSkeletonClass()}></div>
      ))}
    </>
  );
};

export default Skeleton;
