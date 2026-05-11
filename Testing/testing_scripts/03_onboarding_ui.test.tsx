import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingPage from '@/app/onboarding/page';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock the server action
vi.mock('@/app/actions', () => ({
  saveOnboardingProfile: vi.fn(),
}));

describe('Onboarding UI Component', () => {
  it('renders the first question correctly', () => {
    render(
      <LanguageProvider>
        <OnboardingPage />
      </LanguageProvider>
    );
    
    // The first question should be visible
    expect(screen.getByText(/Where are you currently located/)).toBeInTheDocument();
    
    // The progress text should indicate step 1 of 8
    expect(screen.getByText(/1 \/ 8/)).toBeInTheDocument();
    
    // Options should be present
    expect(screen.getByText('Metro City')).toBeInTheDocument();
    expect(screen.getByText('Tier-2 City')).toBeInTheDocument();
    expect(screen.getByText('Rural Area')).toBeInTheDocument();
    expect(screen.getByText('Village')).toBeInTheDocument();
  });

  it('allows selecting an option and progressing to the next step', () => {
    render(
      <LanguageProvider>
        <OnboardingPage />
      </LanguageProvider>
    );
    
    // Select "Metro City"
    const metroOption = screen.getByText('Metro City');
    fireEvent.click(metroOption);
    
    // The "Next Step" button should be enabled
    const nextButton = screen.getByRole('button', { name: /Continue/i });
    expect(nextButton).not.toBeDisabled();
    
    // Click Next
    fireEvent.click(nextButton);
    
    // Should now be on question 2
    expect(screen.getByText(/What is your highest level of education/)).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 8/)).toBeInTheDocument();
  });
});
