/**
 * @file NavMotion.jsx
 * @description Framer-motion animation wrapper providing subtle opacity and scale transitions for navigation changes.
 * @architecture Encloses view containers across layout hierarchies to animate entering and exiting view routes.
 * @agent_note Relies on framer-motion variants (initial, in, out) with tween easing. Does not introduce DOM bloat; wraps children in a motion.div.
 */

import PropTypes from 'prop-types';


import { motion } from 'framer-motion';



/**
 * @component NavMotion
 * @description Motion container animating view transitions using Framer Motion scale and opacity interpolation.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Route view or component subtree to animate.
 * @state Stateless.
 */
const NavMotion = ({ children }) => {
  const motionVariants = {
    initial: {
      opacity: 0,
      scale: 0.99
    },
    in: {
      opacity: 1,
      scale: 1
    },
    out: {
      opacity: 0,
      scale: 1.01
    }
  };

  const motionTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={motionVariants} transition={motionTransition}>
      {children}
    </motion.div>
  );
};

NavMotion.propTypes = {
  children: PropTypes.node
};

export default NavMotion;
