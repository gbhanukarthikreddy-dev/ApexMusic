import { useEffect, useMemo, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { generateSummitContours } from '../lib/contour';

export function ContourMap() {
  const prefersReduced = useReducedMotion();
  const summit = useMemo(() => generateSummitContours(64, 64, 520, 520), []);

  const { scrollYProgress } = useScroll();
  const shiftY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const markerX = useTransform(scrollYProgress, [0, 1], [116, summit.summitX]);
  const markerY = useTransform(scrollYProgress, [0, 1], [412, summit.summitY]);
  const elevationNum = useTransform(scrollYProgress, [0, 1], [0, 8848]);

  const [elevText, setElevText] = useState('ELEV. 0M');

  useEffect(() => {
    return elevationNum.on('change', (latest) => {
      const formatted = Math.round(latest).toLocaleString('en-US');
      setElevText(`ELEV. ${formatted}M`);
    });
  }, [elevationNum]);

  return (
    <div className="relative flex w-full max-w-[460px] flex-col items-end">
      {/* Live scroll-driven altitude readout */}
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-label text-mute">
        <span className="h-1.5 w-1.5 rounded-full bg-apex" aria-hidden="true" />
        <span>{prefersReduced ? 'ELEV. 8,848M' : elevText}</span>
      </div>

      <motion.div
        style={prefersReduced ? undefined : { y: shiftY }}
        className="w-full"
      >
        <svg
          viewBox={`0 0 ${summit.width} ${summit.height}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label="Topographic elevation contour map of Apex Music summit"
        >
          <defs>
            <radialGradient id="summitGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4500" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle climb trajectory */}
          <line
            x1={116}
            y1={412}
            x2={summit.summitX}
            y2={summit.summitY}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
            strokeDasharray="4 6"
          />

          {/* Topographic contour rings */}
          {summit.rings.map((ring, idx) => (
            <motion.path
              key={ring.value}
              d={ring.d}
              fill="none"
              stroke={
                ring.isHighlight
                  ? 'rgba(242, 242, 240, 0.34)'
                  : 'rgba(255, 255, 255, 0.13)'
              }
              strokeWidth={ring.isHighlight ? 1.25 : 0.9}
              strokeDasharray="1600"
              initial={
                prefersReduced
                  ? { strokeDashoffset: 0, opacity: 1 }
                  : { strokeDashoffset: 1600, opacity: 0 }
              }
              animate={{ strokeDashoffset: 0, opacity: 1 }}
              transition={{
                duration: prefersReduced ? 0 : 1.4,
                delay: prefersReduced ? 0 : idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}

          {/* Glowing orange summit dot */}
          <circle
            cx={summit.summitX}
            cy={summit.summitY}
            r={34}
            fill="url(#summitGlow)"
          />
          <circle
            cx={summit.summitX}
            cy={summit.summitY}
            r={5.5}
            fill="#FF4500"
          />
          <circle
            cx={summit.summitX}
            cy={summit.summitY}
            r={13}
            fill="none"
            stroke="#FF4500"
            strokeOpacity={0.45}
            strokeWidth={1}
          />

          {/* White climbing marker dot */}
          <motion.circle
            cx={prefersReduced ? 220 : markerX}
            cy={prefersReduced ? 310 : markerY}
            r={4}
            fill="#F2F2F0"
          />
        </svg>
      </motion.div>
    </div>
  );
}
