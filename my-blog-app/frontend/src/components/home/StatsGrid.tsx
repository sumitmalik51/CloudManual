import React from 'react';
import { motion } from 'framer-motion';

interface StatsData {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface StatsCardProps {
  stat: StatsData;
  index: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ stat, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 dark:border-gray-700"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${stat.color}`}>
        <span className="text-2xl">{stat.icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text">
        {stat.value}
      </div>
      <div className="text-gray-600 dark:text-gray-300 font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
};

interface StatsGridProps {
  stats: StatsData[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <section className="py-16 px-6 bg-white dark:bg-gray-900" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Trusted by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Developers</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Join thousands of developers who rely on CloudManual for their cloud journey
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
