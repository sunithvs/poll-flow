'use client';

import Hero from "@/components/hero";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const initialPollData = {
  question: "What's your favorite programming language?",
  options: [
    { id: 1, text: "JavaScript", votes: 12 },
    { id: 2, text: "Python", votes: 15 },
    { id: 3, text: "Java", votes: 8 },
    { id: 4, text: "TypeScript", votes: 10 },
  ]
};

const demoResponses = [
  "Alex just voted",
  "Sarah chose an option",
  "John submitted their vote",
  "Emma made their choice",
  "Michael voted",
  "Lisa participated",
  "David cast their vote",
];

export default function Home() {
  const [votes, setVotes] = useState(initialPollData.options.map(opt => ({ ...opt })));
  const [latestVoter, setLatestVoter] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const resetPoll = () => {
    setIsResetting(true);
    setTimeout(() => {
      setVotes(initialPollData.options.map(opt => ({ ...opt })));
      setTotalVotes(0);
      setIsResetting(false);
    }, 500);
  };

  useEffect(() => {
    if (isResetting) return;

    const interval = setInterval(() => {
      const currentTotal = votes.reduce((acc, curr) => acc + curr.votes, 0);
      
      if (currentTotal >= 100) {
        resetPoll();
        return;
      }

      const randomOption = Math.floor(Math.random() * votes.length);
      const randomVoter = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      setVotes(current => 
        current.map((opt, index) => 
          index === randomOption 
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        )
      );
      setTotalVotes(prev => prev + 1);
      setLatestVoter(randomVoter);
    }, 2000);

    return () => clearInterval(interval);
  }, [votes, isResetting]);

  const chartData = {
    labels: votes.map(opt => opt.text),
    datasets: [
      {
        label: 'Votes',
        data: votes.map(opt => opt.votes),
        backgroundColor: 'rgba(147, 51, 234, 0.3)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b',
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 500,
    },
  };

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4 pb-12">
        <div className="mt-12 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Live Demo</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Total Votes: {totalVotes}/100
                </span>
                <button
                  onClick={resetPoll}
                  disabled={isResetting}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">{initialPollData.question}</h3>
              <div className="h-[300px] sm:h-[400px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="space-y-4">
              {votes.map((option) => (
                <motion.div
                  key={option.id}
                  layout
                  className="bg-background rounded-lg p-3 sm:p-4 border border-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="font-medium flex-1">{option.text}</span>
                    <motion.div 
                      key={option.votes}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm font-semibold">{option.votes}</span>
                      <span className="text-sm text-muted-foreground">
                        ({((option.votes / votes.reduce((acc, curr) => acc + curr.votes, 0)) * 100).toFixed(1)}%)
                      </span>
                    </motion.div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(option.votes / votes.reduce((acc, curr) => acc + curr.votes, 0)) * 100}%` 
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              {latestVoter && (
                <motion.div
                  key={latestVoter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-3 bg-primary/5 text-primary rounded-lg text-sm text-center"
                >
                  {latestVoter}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">Watch votes come in instantly with our real-time polling system</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Beautiful Visualizations</h3>
              <p className="text-muted-foreground">See results with animated charts and progress bars</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-card border border-border sm:col-span-2 lg:col-span-1"
            >
              <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
              <p className="text-muted-foreground">Share your polls with a simple link and get instant feedback</p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
