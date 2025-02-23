import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = "", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-300 dark:bg-gray-700 mt-4 rounded-md ${className}`}
        ></div>
      ))}
    </>
  );
};

export default SkeletonLoader;
