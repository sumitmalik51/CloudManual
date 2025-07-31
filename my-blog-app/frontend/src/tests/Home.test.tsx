import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Mock the React Router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock the performance monitoring
vi.mock('../utils/performance', () => ({
  usePerformanceMonitor: () => ({
    startTiming: vi.fn(() => 'test-id'),
    endTiming: vi.fn(() => 100),
    trackApiCall: vi.fn(),
    getMetrics: vi.fn(() => ({
      core: { lcp: 1200, fid: 50, cls: 0.05, fcp: 800, ttfb: 200 },
      custom: {}
    })),
    reportMetrics: vi.fn(),
    checkBudgets: vi.fn(() => ({ passed: true, violations: [] }))
  })
}));

// Mock the personalization hook
vi.mock('../hooks/usePersonalization', () => ({
  usePersonalization: () => ({
    preferences: {
      favoriteCategories: ['Technology'],
      favoriteAuthors: ['John Doe'],
      readingGoals: { dailyMinutes: 30 }
    },
    updatePreferences: vi.fn(),
    toggleBookmark: vi.fn(() => true),
    isBookmarked: vi.fn(() => false),
    startReading: vi.fn(),
    updateProgress: vi.fn(),
    getReadingHistory: vi.fn(() => []),
    getRecommendations: vi.fn(() => []),
    getReadingStats: vi.fn(() => ({ totalTimeMinutes: 120, postsRead: 5, streak: 3 })),
    exportData: vi.fn(),
    clearData: vi.fn()
  })
}));

// Mock components that might not exist yet
vi.mock('../components/performance/PerformanceDashboard', () => ({
  PerformanceDashboard: () => <div data-testid="performance-dashboard">Performance Dashboard</div>
}));

vi.mock('../components/search/AdvancedSearchFilters', () => ({
  AdvancedSearchFilters: ({ onFiltersChange }: any) => (
    <div data-testid="search-filters">
      <button onClick={() => onFiltersChange({ query: 'test' })}>
        Apply Filters
      </button>
    </div>
  )
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock fetch for blog posts
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([])
    });

    // Reset localStorage mock to return null by default
    const localStorage = global.localStorage as any;
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithRouter(<Home />);
    expect(container).toBeInTheDocument();
  });

  it('renders the CloudManual title', () => {
    const { getAllByText } = renderWithRouter(<Home />);
    const cloudManualElements = getAllByText('CloudManual');
    expect(cloudManualElements.length).toBeGreaterThan(0);
    expect(cloudManualElements[0]).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    const { container } = renderWithRouter(<Home />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
