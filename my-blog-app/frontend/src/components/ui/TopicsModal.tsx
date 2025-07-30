import React from 'react';

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Array<{
    name: string;
    count: number;
    color: string;
    description: string;
  }>;
}

const TopicsModal: React.FC<TopicsModalProps> = ({ isOpen, onClose, topics }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform transition-all duration-300 scale-100 opacity-100">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Content Topics Breakdown
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Explore our comprehensive coverage across different technology domains. Each topic represents a curated collection of articles, tutorials, and guides.
              </p>

              <div className="space-y-4">
                {topics.map((topic) => (
                  <div 
                    key={topic.name}
                    className="group relative p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                  >
                    {/* Progress bar background */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${topic.color} opacity-10 transition-all duration-500 group-hover:opacity-20`}
                        style={{ width: `${Math.min((topic.count / Math.max(...topics.map(t => t.count))) * 100, 100)}%` }}
                      ></div>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${topic.color}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {topic.name}
                          </h3>
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium">
                            {topic.count} {topic.count === 1 ? 'article' : 'articles'}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {topic.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {topics.reduce((sum, topic) => sum + topic.count, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {topics.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Topics Covered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(topics.reduce((sum, topic) => sum + topic.count, 0) / topics.length)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Avg per Topic</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                Explore All Topics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsModal;
