"use client";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Floating orbs */}
      <div className="orb-blue absolute top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.06] blur-[130px]" />
      <div className="orb-orange absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/[0.04] blur-[120px]" />
      <div className="orb-teal absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-blue-400/[0.03] blur-[150px]" />
      <div className="orb-blue absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-orange-400/[0.03] blur-[100px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060B14]" />
    </div>
  );
}

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
