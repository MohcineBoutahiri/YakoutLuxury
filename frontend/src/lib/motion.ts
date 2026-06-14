export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export const smoothTransition: Transition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
};

export const quickTransition: Transition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
};
import type { Transition } from "framer-motion";
