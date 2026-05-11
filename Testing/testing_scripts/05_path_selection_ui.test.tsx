import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PathSelectionClient from '@/app/path-selection/PathSelectionClient';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '@/context/LanguageContext';
import * as actions from '@/app/actions';

// Mock the server actions and next/navigation
vi.mock('@/app/actions', () => ({
  generateAndSavePathOptions: vi.fn(),
  selectPath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

describe('Path Selection UI Component', () => {
  it('renders the loading state when initialPaths is empty', async () => {
    // Setup mock to resolve paths slowly so we can see loading state
    (actions.generateAndSavePathOptions as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(
      <LanguageProvider>
        <PathSelectionClient initialPaths={[]} />
      </LanguageProvider>
    );
    
    expect(screen.getByText('Analyzing Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/We're mapping your skills/)).toBeInTheDocument();
  });

  it('renders path cards when paths are provided', () => {
    const mockPaths = [
      {
        id: '1',
        pathTitle: 'Test Path',
        practicalSummary: 'Test Summary',
        estimatedIncomeMin: 15000,
        estimatedIncomeMax: 20000,
        estimatedWeeks: 4,
        matchReason: 'Test Match',
        previewWeeks: [{ week: 1, focus: 'Test Focus' }]
      }
    ];

    render(
      <LanguageProvider>
        <PathSelectionClient initialPaths={mockPaths} />
      </LanguageProvider>
    );
    
    // Check if the card rendered
    expect(screen.getByText('Test Path')).toBeInTheDocument();
    expect(screen.getByText('Test Summary')).toBeInTheDocument();
    
    // Check if income formatted correctly
    expect(screen.getByText(/₹15,000 - ₹20,000/)).toBeInTheDocument();
    
    // Button should be available
    expect(screen.getByRole('button', { name: /Select This Path/i })).toBeInTheDocument();
  });

  it('calls selectPath when a path is chosen', async () => {
    const mockPaths = [
      {
        id: 'path_123',
        pathTitle: 'Test Path',
        practicalSummary: 'Test Summary',
        estimatedIncomeMin: 15000,
        estimatedIncomeMax: 20000,
        estimatedWeeks: 4,
        matchReason: 'Test Match',
        previewWeeks: []
      }
    ];

    (actions.selectPath as any).mockResolvedValue(undefined);

    render(
      <LanguageProvider>
        <PathSelectionClient initialPaths={mockPaths} />
      </LanguageProvider>
    );
    
    const selectButton = screen.getByRole('button', { name: /Select This Path/i });
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(actions.selectPath).toHaveBeenCalledWith('path_123');
    });
  });
});
