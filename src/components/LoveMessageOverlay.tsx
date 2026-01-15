import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import { Heart, Star } from 'lucide-react';

interface LoveMessageOverlayProps {
    date?: string; // Optional for now to avoid breaking if not passed yet, but plan to pass it
}

export function LoveMessageOverlay({ date }: LoveMessageOverlayProps) {
    const { tempMessage, weeklyTasks } = useHabits();

    // Find all starred tasks for this specific date - ONLY COMPLETED ONES (White Stars)
    const starredTasks = date ? weeklyTasks.filter(t => t.starredDates?.includes(date) && t.isCompleted) : [];



    return (
        <div className="fixed top-0 left-0 right-0 pointer-events-none z-50">
            {/* Daily Star Bubbles - "Star in the distance" - Positioned Top Left */}
            <div className="absolute top-20 left-4 flex flex-col items-start gap-2">
                <AnimatePresence>
                    {starredTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.9 }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                                delay: index * 0.1 // Stagger entrance
                            }}
                            className="flex items-center gap-2 bg-yellow-50/95 backdrop-blur-sm pl-3 pr-4 py-2.5 rounded-full border border-yellow-200 shadow-[0_4px_20px_-4px_rgba(250,204,21,0.3)] pointer-events-auto mb-2"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2 + (index * 0.1), type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            </motion.div>
                            <span className="text-sm font-bold text-yellow-800 font-hand leading-none pt-0.5">
                                {task.title}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Existing Love Message / Temporary Message - Centered */}
            <AnimatePresence>
                {tempMessage && (
                    <div className="absolute top-6 left-0 right-0 flex justify-center items-start">
                        <motion.div
                            key="temp-message"
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
        </div>
    );
}
