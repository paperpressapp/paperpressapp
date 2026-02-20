"use client";

import { motion } from "framer-motion";

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function AppLoader({ message = "Loading...", fullScreen = true }: AppLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-2xl shadow-[#1E88E5]/40"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              d="M14 2V8H20"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
            <motion.line
              x1="8"
              y1="13"
              x2="16"
              y2="13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            />
            <motion.line
              x1="8"
              y1="17"
              x2="14"
              y2="17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            />
          </motion.svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
        >
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-[#1E88E5]"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.p
          className="text-white font-semibold text-lg"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>

      <motion.div
        className="flex gap-1 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] flex items-center justify-center">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-white/5"
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  return content;
}

export function QuickLoader({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1565C0]"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="w-full h-full rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1565C0]"
          style={{ 
            clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" 
          }}
        />
      </motion.div>
    </div>
  );
}
