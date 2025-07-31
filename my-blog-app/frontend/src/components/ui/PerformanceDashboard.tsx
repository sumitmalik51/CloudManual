import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMonitor } from '../../utils/performance';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onClose }) => {
  const { getMetrics, checkBudgets } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<any>({});
  const [budgetCheck, setBudgetCheck] = useState<{ passed: boolean; violations: string[] }>({ passed: true, violations: [] });

  useEffect(() => {
    if (isVisible) {
      const updateMetrics = () => {
        setMetrics(getMetrics());
        setBudgetCheck(checkBudgets());
      };
      
      updateMetrics();
      const interval = setInterval(updateMetrics, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, getMetrics, checkBudgets]);

  const getScoreColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.needs) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreText = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.needs) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">Performance Dashboard</h2>
                <p className="text-blue-100">Real-time Core Web Vitals & Custom Metrics</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Overall Score */}
              <div className="mb-8">
                <div className={`text-center p-6 rounded-xl ${budgetCheck.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                  <div className={`text-6xl font-bold mb-2 ${budgetCheck.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {budgetCheck.passed ? '✓' : '⚠'}
                  </div>
                  <h3 className={`text-xl font-semibold ${budgetCheck.passed ? 'text-green-800' : 'text-red-800'}`}>
                    {budgetCheck.passed ? 'Performance Budget: PASSED' : 'Performance Budget: NEEDS ATTENTION'}
                  </h3>
                  {budgetCheck.violations.length > 0 && (
                    <div className="mt-3 text-sm text-red-700">
                      <p className="mb-1 font-medium">Issues found:</p>
                      {budgetCheck.violations.map((violation, index) => (
                        <p key={index} className="text-xs">• {violation}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Largest Contentful Paint</h4>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.core?.lcp || 0, { good: 2500, needs: 4000 })}`}>
                      {metrics.core?.lcp ? `${(metrics.core.lcp / 1000).toFixed(2)}s` : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.core?.lcp ? getScoreText(metrics.core.lcp, { good: 2500, needs: 4000 }) : 'Measuring...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Good: &lt;2.5s | Needs Improvement: 2.5-4.0s
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">First Input Delay</h4>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.core?.fid || 0, { good: 100, needs: 300 })}`}>
                      {metrics.core?.fid ? `${metrics.core.fid.toFixed(0)}ms` : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.core?.fid ? getScoreText(metrics.core.fid, { good: 100, needs: 300 }) : 'Measuring...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Good: &lt;100ms | Needs Improvement: 100-300ms
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Cumulative Layout Shift</h4>
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.core?.cls || 0, { good: 0.1, needs: 0.25 })}`}>
                      {metrics.core?.cls ? metrics.core.cls.toFixed(3) : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.core?.cls ? getScoreText(metrics.core.cls, { good: 0.1, needs: 0.25 }) : 'Measuring...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Good: &lt;0.1 | Needs Improvement: 0.1-0.25
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">First Contentful Paint</h4>
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.core?.fcp || 0, { good: 1800, needs: 3000 })}`}>
                      {metrics.core?.fcp ? `${(metrics.core.fcp / 1000).toFixed(2)}s` : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.core?.fcp ? getScoreText(metrics.core.fcp, { good: 1800, needs: 3000 }) : 'Measuring...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Good: &lt;1.8s | Needs Improvement: 1.8-3.0s
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Time to First Byte</h4>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getScoreColor(metrics.core?.ttfb || 0, { good: 600, needs: 1500 })}`}>
                      {metrics.core?.ttfb ? `${metrics.core.ttfb.toFixed(0)}ms` : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.core?.ttfb ? getScoreText(metrics.core.ttfb, { good: 600, needs: 1500 }) : 'Measuring...'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Good: &lt;600ms | Needs Improvement: 600-1500ms
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Page Load Time</h4>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-indigo-600">
                      {metrics.custom?.pageLoadTime ? `${(metrics.custom.pageLoadTime / 1000).toFixed(2)}s` : '--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total page load time
                    </div>
                    <div className="text-xs text-gray-500">
                      Full page load duration
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Tips */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Performance Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200">✅ Optimizations Active:</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Lazy loading images</li>
                      <li>• Code splitting with React.lazy</li>
                      <li>• Memoized components</li>
                      <li>• Optimized animations</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200">🚀 Next Steps:</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Image compression pipeline</li>
                      <li>• Service worker caching</li>
                      <li>• CDN implementation</li>
                      <li>• Bundle size optimization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PerformanceDashboard;
