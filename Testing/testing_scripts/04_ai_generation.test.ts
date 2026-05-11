import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePathOptionsAI } from '@/lib/ai/generate-paths';
import { generateInitialRoadmapAI } from '@/lib/ai/generate-roadmap';

// Mock the AI SDK to prevent actual API calls and save credits/time
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

// We need to import the mocked module to control its return value
import { generateObject } from 'ai';

describe('AI Generation Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generatePathOptionsAI correctly formats the prompt and returns paths', async () => {
    const mockPaths = [
      {
        title: "Mock Path 1",
        summary: "Summary 1",
        incomeMin: 10000,
        incomeMax: 15000,
        weeks: 4,
        matchReason: "Match 1",
        previewWeeks: [{ week: 1, focus: "Focus 1" }]
      }
    ];

    // Setup the mock to return our fake data matching the schema
    (generateObject as any).mockResolvedValue({
      object: { paths: mockPaths }
    });

    const result = await generatePathOptionsAI('{"location": "Metro"}');

    expect(generateObject).toHaveBeenCalledTimes(1);
    const callArgs = (generateObject as any).mock.calls[0][0];
    
    // Verify prompt construction
    expect(callArgs.prompt).toContain('Generate paths for the following user profile:');
    expect(callArgs.prompt).toContain('{"location": "Metro"}');
    
    // Verify response handling
    expect(result).toEqual(mockPaths);
  });

  it('generateInitialRoadmapAI correctly requests 2 modules', async () => {
    const mockModules = [
      { module_id: 1, module_title: 'M1', subtopics: [] },
      { module_id: 2, module_title: 'M2', subtopics: [] }
    ];

    (generateObject as any).mockResolvedValue({
      object: { modules: mockModules }
    });

    const result = await generateInitialRoadmapAI('PathContext', 'ProfileContext');

    expect(generateObject).toHaveBeenCalledTimes(1);
    const callArgs = (generateObject as any).mock.calls[0][0];
    
    expect(callArgs.prompt).toContain('PathContext');
    expect(callArgs.prompt).toContain('ProfileContext');
    expect(result).toEqual(mockModules);
  });
});
