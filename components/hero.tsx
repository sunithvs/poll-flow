'use client';

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { BackgroundLines } from "./ui/background-lines";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      ease: "easeOut",
      duration: 1
    }
  }
};

const letterVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: { 
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    }
  }
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background effects */}
      <BackgroundLines className="opacity-50" />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Animated title */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex justify-center items-center flex-wrap mb-8"
          >
            {"Poll Flow".split("").map((letter, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                style={{
                  textShadow: '0 0 30px rgba(147, 51, 234, 0.15)',
                  perspective: '1000px'
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5,
              ease: "easeOut"
            }}
          >
            Create engaging polls and watch responses flow in real-time
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 1.2,
              ease: "easeOut"
            }}
            className="relative inline-block"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-white/90 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Animated border gradient */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-50"
                style={{
                  background: `
                    linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(147, 51, 234, 0.2) 50%,
                      transparent 100%
                    )
                  `,
                  backgroundSize: '200% 100%',
                }}
                animate={{
                  backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(147, 51, 234, 0)',
                    '0 0 20px 2px rgba(147, 51, 234, 0.3)',
                    '0 0 0 0 rgba(147, 51, 234, 0)'
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Button content with hover animation */}
              <motion.div 
                className="relative flex items-center gap-3 z-20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.span 
                  className="relative font-medium text-zinc-900"
                  initial={{ opacity: 0.9 }}
                  whileHover={{ opacity: 1 }}
                >
                  Create Your Poll
                </motion.span>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <ArrowRight className="w-5 h-5 text-zinc-900" />
                </motion.div>

                {/* Sparkle effects */}
                <motion.div
                  className="absolute -inset-1 opacity-0 group-hover:opacity-100 -z-10"
                  initial={false}
                  animate={{
                    background: [
                      'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)'
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  zIndex: 15,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />
            </Link>

            {/* Background blur effect */}
            <motion.div
              className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15), transparent 70%)',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll parallax effect */}
      <motion.div 
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-muted to-transparent"
        style={{ y, opacity }}
      />
    </motion.div>
  );
}
