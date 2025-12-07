import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.98
  },
};

const pageTransition = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth animation
  duration: 0.4
};

export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
