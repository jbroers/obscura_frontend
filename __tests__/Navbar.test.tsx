import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders all navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('contains correct href attributes', () => {
    render(<Navbar />);

    const homeLink = screen.getByText('Home').closest('a');
    const photosLink = screen.getByText('Photos').closest('a');
    const statisticsLink = screen.getByText('Statistics').closest('a');
    const aboutLink = screen.getByText('About').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(photosLink).toHaveAttribute('href', '/photos');
    expect(statisticsLink).toHaveAttribute('href', '/statistics');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('renders as a nav element', () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector('nav');

    expect(nav).toBeInTheDocument();
  });
});

