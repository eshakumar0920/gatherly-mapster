
import React, { useEffect } from "react";
import { Package, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface LootBoxPopupProps {
  level: number;
  isOpen: boolean;
  onClose: () => void;
}

const LootBoxPopup: React.FC<LootBoxPopupProps> = ({ level, isOpen, onClose }) => {
  // Auto-close after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      
      // Trigger confetti when popup opens
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative w-[90%] max-w-sm rounded-lg overflow-hidden"
          >
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 z-50 bg-white/10 backdrop-blur-sm rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Background with gradient */}
            <div className="bg-gradient-to-b from-purple-600/90 to-indigo-800/90 p-6 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium mb-2">
                  <Star className="h-4 w-4 mr-1 fill-yellow-300" /> LEVEL UP!
                </div>
                
                <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
                <p className="text-white/80">You've reached</p>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                  Level {level}
                </div>
                
                {/* Animated loot box */}
                <motion.div 
                  className="mt-4 mb-6 w-28 h-28 mx-auto"
                  initial={{ rotateY: 0 }}
                  animate={{ 
                    rotateY: 360, 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    rotateY: {
                      repeat: Infinity,
                      duration: 6,
                      ease: "linear"
                    },
                    scale: {
                      repeat: Infinity,
                      duration: 2,
                    }
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Package className="h-full w-full text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" strokeWidth={1.5} />
                    <motion.div 
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Star className="absolute top-1/4 left-1/4 h-3 w-3 text-yellow-200" fill="currentColor" />
                      <Star className="absolute bottom-1/4 right-1/4 h-4 w-4 text-yellow-200" fill="currentColor" />
                      <Star className="absolute top-1/3 right-1/3 h-2 w-2 text-yellow-200" fill="currentColor" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <div className="text-white/70 text-sm">
                  <p>Keep joining meetups to earn more points and unlock new rewards!</p>
                </div>
                
                <Button
                  className="mt-4 bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-black font-medium w-full"
                  onClick={onClose}
                >
                  Awesome!
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LootBoxPopup;
