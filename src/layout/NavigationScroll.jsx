/**
 * @file NavigationScroll.jsx
 * @description Viewport scroll reset utility ensuring navigation resets window coordinates to top-left.
 * @architecture Wraps route definitions or layout outlets to reset viewport elevation upon route changes.
 * @agent_note Executes window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) on initial mount. Operates alongside Lenis scroll engine.
 */

import PropTypes from 'prop-types';
import { useEffect } from 'react';


/**
 * @component NavigationScroll
 * @description Transparent wrapper that scrolls the window back to (0,0) smoothly on initial render.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements rendered transparently.
 * @state Stateless.
 */
const NavigationScroll = ({ children }) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return children || null;
};

NavigationScroll.propTypes = {
  children: PropTypes.node
};

export default NavigationScroll;
