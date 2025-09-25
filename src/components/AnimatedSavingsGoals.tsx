import { useEffect, useState } from "react";

const savingsGoals = [
  { label: "Vacation", color: "bg-orange-400", x: 20, y: 15 },
  { label: "Debt free", color: "bg-gray-400", x: 75, y: 25 },
  { label: "Medical school", color: "bg-teal-500", x: 15, y: 65 },
  { label: "First home", color: "bg-green-500", x: 80, y: 70 },
  { label: "New car", color: "bg-gray-600", x: 45, y: 85 },
];

const floatingDots = [
  { x: 30, y: 20, delay: 0 },
  { x: 60, y: 35, delay: 1 },
  { x: 25, y: 50, delay: 2 },
  { x: 70, y: 55, delay: 3 },
  { x: 85, y: 40, delay: 4 },
];

export function AnimatedSavingsGoals() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
      {/* Animated background dots */}
      {floatingDots.map((dot, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-primary/20 rounded-full animate-pulse"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            animationDelay: `${dot.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
      
      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <pattern id="dashed" patternUnits="userSpaceOnUse" width="4" height="4">
            <circle cx="2" cy="2" r="0.5" fill="currentColor" className="text-green-400/30" />
          </pattern>
        </defs>
        
        {/* Animated curved paths */}
        <path
          d="M 20,20 Q 50,10 80,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="text-green-400/40 animate-pulse"
        />
        <path
          d="M 80,30 Q 90,50 80,70"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="text-green-400/40 animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 80,70 Q 50,85 20,70"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="text-green-400/40 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <path
          d="M 20,70 Q 10,45 20,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          className="text-green-400/40 animate-pulse"
          style={{ animationDelay: '3s' }}
        />
      </svg>

      {/* Savings goal bubbles */}
      {savingsGoals.map((goal, index) => (
        <div
          key={goal.label}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
            mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          style={{
            left: `${goal.x}%`,
            top: `${goal.y}%`,
            transitionDelay: `${index * 200}ms`,
          }}
        >
          {/* Profile circle */}
          <div className={`w-16 h-16 ${goal.color} rounded-full mb-2 animate-bounce shadow-lg`}
               style={{ animationDelay: `${index * 0.5}s`, animationDuration: '3s' }}>
            <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white/40 rounded-full"></div>
            </div>
          </div>
          
          {/* Goal label */}
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
            <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
              {goal.label}
            </span>
          </div>
        </div>
      ))}

      {/* Animated coins */}
      <div className="absolute top-6 right-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
            style={{
              left: `${i * 8}px`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
            }}
          >
            <div className="w-full h-full bg-yellow-300 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Walking people silhouettes */}
      <div className="absolute bottom-4 left-4 flex space-x-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-4 h-6 bg-gray-400/60 rounded-full"
            style={{ animationDelay: `${i * 0.3}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}