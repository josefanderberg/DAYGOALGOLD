import { motion } from 'framer-motion';

interface RainbowCheckmarkProps {
    count: number;
    target: number;
}

export function RainbowCheckmark({ count, target }: RainbowCheckmarkProps) {
    const isComplete = count >= target;

    // Calculate hue based on progress if overshooting, or just a nice gradient
    // Requirement: "red to all the colors on the colorscale"
    // Let's align hue 0 (Red) to hue 360 (Red/Violet) via Green/Blue.
    // We can animate the stroke color or just use a gradient definition.

    return (
        <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Background/Base */}
            {target > 1 && !isComplete && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-400">{count}/{target}</span>
                </div>
            )}

            <svg viewBox="0 0 24 24" className="w-full h-full text-gray-200 overflow-visible">
                {/* Define Gradient */}
                <defs>
                    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff0000" />
                        <stop offset="25%" stopColor="#ffff00" />
                        <stop offset="50%" stopColor="#00ff00" />
                        <stop offset="75%" stopColor="#00ffff" />
                        <stop offset="100%" stopColor="#0000ff" />
                    </linearGradient>
                </defs>

                {/* Checkmark Path */}
                {isComplete && (
                    <motion.path
                        d="M20 6L9 17l-5-5"
                        fill="none"
                        stroke="url(#rainbow)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                    />
                )}

                {!isComplete && count > 0 && (
                    // Small progress ring for partial
                    <circle
                        cx="12" cy="12" r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        opacity="0.3"
                    />
                )}
                {!isComplete && count > 0 && (
                    <motion.circle
                        cx="12" cy="12" r="10"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: count / target }}
                        transform="rotate(-90 12 12)"
                    />
                )}
            </svg>
        </div>
    );
}
