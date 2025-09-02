import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '../not-found-page';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders 404 page content', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(
      screen.getByText(/The page you're looking for doesn't exist/)
    ).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('Go to Home')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('navigates to home when Go to Home button is clicked', () => {
    renderWithRouter(<NotFoundPage />);

    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('navigates back when Go Back button is clicked', () => {
    renderWithRouter(<NotFoundPage />);

    const backButton = screen.getByText('Go Back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('navigates to home when return to homepage link is clicked', () => {
    renderWithRouter(<NotFoundPage />);

    const homepageLink = screen.getByText('return to the homepage');
    fireEvent.click(homepageLink);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
