type WaveDividerProps = {
  /** Tailwind fill class matching the section BELOW the divider, e.g. "fill-white" */
  color: string;
  flip?: boolean;
  className?: string;
};

/** Flowing wave divider — the brand-motif signature element used between sections. */
export default function WaveDivider({ color, flip = false, className = '' }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative -mb-1 -mt-1 h-12 w-full overflow-hidden sm:h-20 ${className}`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? 'rotate-180' : ''}`}
      >
        <path
          d="M0,64 C240,120 480,8 720,48 C960,88 1200,112 1440,56 L1440,120 L0,120 Z"
          className={color}
        />
      </svg>
    </div>
  );
}
