import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { Heart } from 'lucide-react';

export function LoveMessageOverlay() {
    const { tempMessage } = useHabits();

    return (
        <AnimatePresence>
            {tempMessage && (
                <div className="fixed top-6 left-0 right-0 flex justify-center items-start pointer-events-none z-50">
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 25 }}
                        className="flex items-center gap-2 bg-white/95 backdrop-blur-sm pl-3 pr-4 py-2.5 rounded-full border border-pink-100 shadow-[0_4px_20px_-4px_rgba(236,72,153,0.3)] pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Heart size={16} className="text-red-500 fill-red-500" />
                        </motion.div>
                        <span className="text-sm font-bold text-gray-800 font-hand leading-none pt-0.5">
                            {tempMessage}
                        </span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
