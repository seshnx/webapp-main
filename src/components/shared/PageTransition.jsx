import React from 'react';

export default function PageTransition({ children, className = "" }) {
  return (
    <div className={`module-fade-in ${className}`}>
      {children}
    </div>
  );
}
