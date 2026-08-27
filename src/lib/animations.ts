import type { Variants } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const pageEnterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easeOutExpo,
    },
  },
};

export const staggeredRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.5,
      ease: easeOutExpo,
    },
  }),
};

export const menuGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const menuSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: easeOutExpo,
    },
  },
};

export const menuCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easeOutExpo,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.18,
      ease: easeOutExpo,
    },
  },
  hover: {
    y: -6,
    transition: {
      duration: 0.2,
      ease: easeOutExpo,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: easeOutExpo,
    },
  },
};

export const menuImageVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.25,
      ease: easeOutExpo,
    },
  },
};
