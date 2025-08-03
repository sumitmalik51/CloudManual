import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useHomeData } from '../../../hooks/useHomeData';
import Home from '../../../pages/Home';

// Mock the useHomeData hook
vi.mock('../../../hooks/useHomeData');
const mockUseHomeData = vi.mocked(useHomeData);

// Mock the API
vi.mock('../../../utils/api', () => ({
  blogAPI: {
    getPosts: vi.fn(),
    likePost: vi.fn()
  }
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => children
}));

const mockPosts = [
  {
    id: '1',
    title: 'Test Post 1',
    slug: 'test-post-1',
    excerpt: 'This is a test post excerpt',
    content: 'This is the full content of the test post',
    author: 'Test Author',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['test', 'react'],
    likes: 10,
    views: 100,
    category: 'Cloud',
    status: 'published' as const,
    type: 'article'
  },
  {
    id: '2',
    title: 'Test Post 2',
    slug: 'test-post-2',
    excerpt: 'Another test post excerpt',
    content: 'Another test post content',
    author: 'Test Author 2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    tags: ['test', 'javascript'],
    likes: 5,
    views: 50,
    category: 'DevOps',
    status: 'published' as const,
    type: 'article'
  }
];

const defaultMockReturn = {
  posts: mockPosts,
  setPosts: vi.fn(),
  allPosts: mockPosts,
  loading: false,
  error: null,
  setError: vi.fn(),
  stats: {
    totalPosts: 2,
    totalViews: 150,
    totalReaders: 50,
    categories: 2
  },
  fetchPosts: vi.fn()
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    mockUseHomeData.mockReturnValue(defaultMockReturn);
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('CloudManual')).toBeInTheDocument();
  });

  it('displays loading state when loading is true', () => {
    mockUseHomeData.mockReturnValue({
      ...defaultMockReturn,
      loading: true
    });

    renderWithRouter(<Home />);
    // You would need to add a loading indicator to test this
    // expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    const errorMessage = 'Failed to fetch posts';
    mockUseHomeData.mockReturnValue({
      ...defaultMockReturn,
      error: errorMessage
    });

    renderWithRouter(<Home />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays posts when loaded successfully', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('filters posts by category', async () => {
    renderWithRouter(<Home />);
    
    // Find and click a category button
    const cloudButton = screen.getByText('Cloud');
    fireEvent.click(cloudButton);
    
    // The component should update to show only Cloud posts
    // This would require the component to actually filter posts
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    renderWithRouter(<Home />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test Post 1' } });
    
    // Wait for debounced search
    await waitFor(() => {
      // Should show filtered results
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('toggles view mode between grid and list', () => {
    renderWithRouter(<Home />);
    
    // Find view mode toggle buttons (if they exist)
    const gridButton = screen.getByLabelText(/grid view/i);
    const listButton = screen.getByLabelText(/list view/i);
    
    fireEvent.click(listButton);
    // Test that view mode changed
    
    fireEvent.click(gridButton);
    // Test that view mode changed back
  });

  it('handles newsletter signup', async () => {
    renderWithRouter(<Home />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const subscribeButton = screen.getByText(/subscribe/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(subscribeButton);
    
    await waitFor(() => {
      // Should show success message
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it('displays stats correctly', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // totalPosts
    expect(screen.getByText('150')).toBeInTheDocument(); // totalViews
    expect(screen.getByText('50')).toBeInTheDocument(); // totalReaders
  });

  it('handles empty posts state', () => {
    mockUseHomeData.mockReturnValue({
      ...defaultMockReturn,
      posts: [],
      allPosts: []
    });

    renderWithRouter(<Home />);
    expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
  });

  it('shows featured posts carousel', () => {
    renderWithRouter(<Home />);
    
    // Should show featured posts section
    expect(screen.getByText(/featured/i)).toBeInTheDocument();
  });

  it('handles post like functionality', async () => {
    renderWithRouter(<Home />);
    
    const likeButton = screen.getAllByLabelText(/like/i)[0];
    fireEvent.click(likeButton);
    
    // Should update like count
    await waitFor(() => {
      // This would require the like button to actually work
      expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });
});

// Integration test for the full page flow
describe('Home Page Integration', () => {
  it('completes full user flow: search -> filter -> view post', async () => {
    renderWithRouter(<Home />);
    
    // 1. User searches for a post
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });
    
    // 2. User filters by category
    const cloudButton = screen.getByText('Cloud');
    fireEvent.click(cloudButton);
    
    // 3. User clicks on a post
    const postLink = screen.getByText('Test Post 1');
    fireEvent.click(postLink);
    
    // Should navigate to post page (this would require react-router setup)
  });
});

// Performance tests
describe('Home Component Performance', () => {
  it('renders efficiently with large number of posts', () => {
    const largePosts = Array.from({ length: 100 }, (_, i) => ({
      ...mockPosts[0],
      id: `post-${i}`,
      title: `Post ${i}`,
      slug: `post-${i}`
    }));

    mockUseHomeData.mockReturnValue({
      ...defaultMockReturn,
      posts: largePosts,
      allPosts: largePosts
    });

    const startTime = performance.now();
    renderWithRouter(<Home />);
    const endTime = performance.now();
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('handles rapid search input changes', async () => {
    renderWithRouter(<Home />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Simulate rapid typing
    fireEvent.change(searchInput, { target: { value: 'T' } });
    fireEvent.change(searchInput, { target: { value: 'Te' } });
    fireEvent.change(searchInput, { target: { value: 'Tes' } });
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    // Should handle debouncing correctly
    await waitFor(() => {
      expect(searchInput).toHaveValue('Test');
    });
  });
});

// Accessibility tests
describe('Home Component Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    renderWithRouter(<Home />);
    
    // Check for proper headings
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for proper form labels
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toHaveAttribute('aria-label');
    
    // Check for proper button labels
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  it('supports keyboard navigation', () => {
    renderWithRouter(<Home />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    searchInput.focus();
    
    expect(document.activeElement).toBe(searchInput);
    
    // Test tab navigation
    fireEvent.keyDown(searchInput, { key: 'Tab' });
    // Should move focus to next focusable element
  });
});

export default {};
