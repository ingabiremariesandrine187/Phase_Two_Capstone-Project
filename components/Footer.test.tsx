import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from './Footer'; // Adjust import path as needed

// Mock the constants
jest.mock('../lib/constants', () => ({
  APP_NAME: 'TestApp'
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };

  MockLink.displayName = 'MockNextLink';  // ✅ Add display name

  return MockLink;
});

describe('Footer Component', () => {
  // Test 1: Basic Rendering
  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  // Test 2: Brand Section
  it('displays brand information correctly', () => {
    render(<Footer />);
    
    // Check app name
    expect(screen.getByText('TestApp')).toBeInTheDocument();
    
    // Check description
    expect(screen.getByText(/beautiful platform for writers and readers/i)).toBeInTheDocument();
  });

  // Test 3: Platform Links
  it('renders all platform links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /careers/i })).toHaveAttribute('href', '/careers');
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
  });

  // Test 4: Resources Links
  it('renders all resources links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /help center/i })).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /guidelines/i })).toHaveAttribute('href', '/guidelines');
  });

  // Test 5: Social Media Links
  it('renders social media links with correct attributes', () => {
    render(<Footer />);
    
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    const githubLink = screen.getByRole('link', { name: /github/i });
    
    // Check href attributes
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com');
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    
    // Check external link attributes
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // Test 6: Copyright Information
  it('displays current year in copyright', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    
    expect(screen.getByText(`© ${currentYear} TestApp. All rights reserved.`)).toBeInTheDocument();
  });

  // Test 7: Section Headings
  it('renders all section headings', () => {
    render(<Footer />);
    
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  // Test 8: Grid Layout
  it('has correct grid layout classes', () => {
    const { container } = render(<Footer />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-4');
  });

  // Test 9: Styling Classes
  it('applies correct styling classes', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-[#faf9f6]', 'border-t', 'border-gray-200');
  });

  // Test 10: Home Link
  it('has home link with correct href', () => {
    render(<Footer />);
    
    const homeLink = screen.getByRole('link', { name: /TestApp/i });
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  // Test 11: Responsive Design
  it('has responsive design classes', () => {
    const { container } = render(<Footer />);
    
    const mainContainer = container.querySelector('.max-w-7xl');
    expect(mainContainer).toBeInTheDocument();
    
    const responsiveGrid = container.querySelector('.md\\:grid-cols-4');
    expect(responsiveGrid).toBeInTheDocument();
  });

  // Test 12: Accessibility
  it('has proper semantic HTML structure', () => {
    const { container } = render(<Footer />);
    
    // Should use footer element
    expect(container.querySelector('footer')).toBeInTheDocument();
    
    // Should have lists for navigation
    const lists = container.querySelectorAll('ul');
    expect(lists.length).toBe(4); // Platform, Resources, Connect + one more
  });
});

// Optional: Snapshot Test
describe('Footer Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});