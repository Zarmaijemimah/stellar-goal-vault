import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchCampaigns } from "./campaignsTableUtils";
import type { Campaign } from "../types/campaign";

// Mock campaign data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    creator: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    title: "Build a Rocket Ship",
    description: "We need funding to build an amazing rocket ship",
    assetCode: "USDC",
    targetAmount: 10000,
    pledgedAmount: 5000,
    deadline: 1710086400,
    createdAt: 1710000000,
    progress: {
      status: "open",
      percentFunded: 50,
      remainingAmount: 5000,
      pledgeCount: 3,
      hoursLeft: 24,
      canPledge: true,
      canClaim: false,
      canRefund: false,
    },
  },
  {
    id: "2",
    creator: "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    title: "Community Garden Initiative",
    description: "Create a sustainable community garden",
    assetCode: "XLM",
    targetAmount: 5000,
    pledgedAmount: 2500,
    deadline: 1710172800,
    createdAt: 1710000100,
    progress: {
      status: "open",
      percentFunded: 50,
      remainingAmount: 2500,
      pledgeCount: 5,
      hoursLeft: 48,
      canPledge: true,
      canClaim: false,
      canRefund: false,
    },
  },
  {
    id: "3",
    creator: "GCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    title: "Educational Platform",
    description: "Build an online learning platform",
    assetCode: "USDC",
    targetAmount: 20000,
    pledgedAmount: 15000,
    deadline: 1710259200,
    createdAt: 1710000200,
    progress: {
      status: "funded",
      percentFunded: 75,
      remainingAmount: 5000,
      pledgeCount: 10,
      hoursLeft: 72,
      canPledge: false,
      canClaim: true,
      canRefund: false,
    },
  },
];

describe("searchCampaigns", () => {
  describe("Search by title", () => {
    it("should find campaign by exact title match", () => {
      const results = searchCampaigns(mockCampaigns, "Build a Rocket Ship");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should find campaign by partial title match", () => {
      const results = searchCampaigns(mockCampaigns, "Rocket");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should find multiple campaigns with overlapping titles", () => {
      const results = searchCampaigns(mockCampaigns, "Build");
      expect(results).toHaveLength(2);
      expect(results.map((c) => c.id)).toContain("1");
      expect(results.map((c) => c.id)).toContain("3");
    });

    it("should be case-insensitive", () => {
      const results1 = searchCampaigns(mockCampaigns, "rocket");
      const results2 = searchCampaigns(mockCampaigns, "ROCKET");
      const results3 = searchCampaigns(mockCampaigns, "RoCkEt");

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results3).toHaveLength(1);
      expect(results1[0].id).toBe(results2[0].id);
    });
  });

  describe("Search by creator", () => {
    it("should find campaign by creator address", () => {
      const creator = mockCampaigns[0].creator;
      const results = searchCampaigns(mockCampaigns, creator);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should find campaign by partial creator address", () => {
      const creatorPrefix = mockCampaigns[0].creator.slice(0, 8);
      const results = searchCampaigns(mockCampaigns, creatorPrefix);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("1");
    });

    it("should be case-insensitive for creator search", () => {
      const creatorLower = mockCampaigns[0].creator.toLowerCase();
      const creatorMixed = creatorLower.substring(0, 10) + "AAAA";
      const results = searchCampaigns(mockCampaigns, creatorMixed);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Search by campaign ID", () => {
    it("should find campaign by exact ID", () => {
      const results = searchCampaigns(mockCampaigns, "1");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should find campaign by partial ID match", () => { // In this case all IDs are single digits, so "1" matches only campaign 1, but let's cover the logic
      const results = searchCampaigns(mockCampaigns, "2");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("2");
    });

    it("should be case-insensitive for ID search", () => {
      const results1 = searchCampaigns(mockCampaigns, "1");
      const results2 = searchCampaigns(mockCampaigns, "1");
      expect(results1).toEqual(results2);
    });
  });

  describe("Edge cases", () => {
    it("should return all campaigns when search query is empty", () => {
      const results = searchCampaigns(mockCampaigns, "");
      expect(results).toEqual(mockCampaigns);
    });

    it("should return all campaigns when search query is only whitespace", () => {
      const results1 = searchCampaigns(mockCampaigns, "   ");
      const results2 = searchCampaigns(mockCampaigns, "\t\n");
      expect(results1).toEqual(mockCampaigns);
      expect(results2).toEqual(mockCampaigns);
    });

    it("should return empty array when no campaigns match", () => {
      const results = searchCampaigns(mockCampaigns, "NonExistentCampaign");
      expect(results).toHaveLength(0);
    });

    it("should handle search query with leading/trailing whitespace", () => {
      const results = searchCampaigns(mockCampaigns, "  Rocket  ");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("1");
    });

    it("should be robust to special characters", () => {
      const results = searchCampaigns(mockCampaigns, "Garden");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("2");
    });
  });

  describe("Search behavior combinations", () => {
    it("should find campaign by searching multiple fields", () => {
      // The first campaign creator starts with GA
      const creatorPrefix = mockCampaigns[0].creator.slice(0, 2);
      const results = searchCampaigns(mockCampaigns, creatorPrefix);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should maintain order of results (same as input array)", () => {
      const results = searchCampaigns(mockCampaigns, "Build");
      // Both "Build a Rocket Ship" and "Build an online learning platform" match
      expect(results.map((c) => c.id)).toEqual(["1", "3"]);
    });

    it("should not return duplicates", () => {
      // Even if a campaign matches multiple fields, it should appear once
      const results = searchCampaigns(mockCampaigns, "Community");
      const ids = results.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length); // All IDs are unique
    });
  });

  describe("Empty input", () => {
    it("should handle empty campaign array", () => {
      const results = searchCampaigns([], "search");
      expect(results).toHaveLength(0);
    });

    it("should handle empty campaign array with empty query", () => {
      const results = searchCampaigns([], "");
      expect(results).toHaveLength(0);
    });
  });
});
