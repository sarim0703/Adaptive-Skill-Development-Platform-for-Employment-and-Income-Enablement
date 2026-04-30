/**
 * VERIFIED LEARNING RESOURCES
 * This file contains high-quality, manually researched links for the most common 
 * career paths on CareerOrbit. The API uses this as a "Knowledge Base" to prevent 
 * AI hallucinations and provide 100% working links.
 */

export type VerifiedResource = {
  title: string;
  url: string;
  type: "video" | "article" | "course";
  description: string;
  source: string;
};

export const VERIFIED_RESOURCES_DB: Record<string, VerifiedResource[]> = {
  "solar": [
    {
      title: "Introduction to Renewable Energy",
      url: "https://www.solarenergy.org/courses/re100-free-intro-to-renewable-energy/",
      type: "course",
      source: "Solar Energy International",
      description: "A comprehensive free introduction to solar and renewable energy fundamentals.",
    },
    {
      title: "Homeowner's Guide to Going Solar",
      url: "https://www.energy.gov/eere/solar/homeowners-guide-going-solar",
      type: "article",
      source: "Energy.gov",
      description: "The official technical guide on how solar PV systems work and are installed.",
    },
    {
      title: "Solar PV Design and Installation Free Course",
      url: "https://www.heatspring.com/courses/introduction-to-solar-pv-design-installation-and-code",
      type: "course",
      source: "HeatSpring",
      description: "Learn the basic design and installation codes for solar PV systems.",
    }
  ],
  "ac repair": [
    {
      title: "Air Conditioning Basics & How it Works",
      url: "https://www.youtube.com/watch?v=7pG9K-Z0T8w",
      type: "video",
      source: "Engineering Mindset",
      description: "High-quality visual breakdown of how AC systems work internally.",
    },
    {
      title: "HVAC Troubleshooting Guide",
      url: "https://www.ac-service.com/troubleshooting-guide",
      type: "article",
      source: "AC Service",
      description: "Practical steps to diagnose common problems in split and window ACs.",
    }
  ],
  "electrician": [
    {
      title: "Electrical Safety First",
      url: "https://www.electricalsafetyfirst.org.uk/guidance/",
      type: "article",
      source: "Safety First",
      description: "Crucial safety guidelines for handling domestic and industrial wiring.",
    },
    {
      title: "Basic House Wiring Explained",
      url: "https://www.youtube.com/watch?v=zN_VpE_2L2c",
      type: "video",
      source: "Electrician U",
      description: "A professional electrician explains standard circuit wiring and outlets.",
    }
  ],
  "plumbing": [
    {
      title: "Introduction to Plumbing Systems",
      url: "https://www.khanacademy.org/humanities/art-asia/concepts-in-art-infrastructure/v/plumbing",
      type: "article",
      source: "Khan Academy",
      description: "Learn the core concepts of water pressure, drainage, and pipe systems.",
    }
  ],
  "digital marketing": [
    {
      title: "Google Digital Garage: Fundamentals",
      url: "https://skillshop.exceedlms.com/student/path/69428-fundamentals-of-digital-marketing",
      type: "course",
      source: "Google",
      description: "Master the basics of digital marketing with Google's official certification course.",
    }
  ]
};

/**
 * Finds verified resources based on the subtopic title.
 * Uses fuzzy matching (keyword check).
 */
export function findVerifiedResources(title: string): VerifiedResource[] {
  const normalizedTitle = title.toLowerCase();
  
  for (const [key, resources] of Object.entries(VERIFIED_RESOURCES_DB)) {
    if (normalizedTitle.includes(key)) {
      return resources;
    }
  }
  
  return [];
}
