import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MouseFollower() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);

  const outerX = useSpring(x, { stiffness: 55, damping: 18, mass: 0.9 });
  const outerY = useSpring(y, { stiffness: 55, damping: 18, mass: 0.9 });

  const innerX = useSpring(x, { stiffness: 140, damping: 20, mass: 0.4 });
  const innerY = useSpring(y, { stiffness: 140, damping: 20, mass: 0.4 });

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <>
      {/* Large ambient orb — lags behind cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[9990] rounded-full"
        style={{
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.09) 0%, rgba(124,58,237,0.04) 45%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {/* Medium tighter orb */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[9990] rounded-full"
        style={{
          x: innerX,
          y: innerY,
          translateX: "-50%",
          translateY: "-50%",
          width: 90,
          height: 90,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          filter: "blur(3px)",
        }}
      />
    </>
  );
}
