import type { Campaign } from "../types/campaign";

/**
 * Returns sorted, deduplicated assetCode values from the given campaigns.
 */
export function getDistinctAssetCodes(campaigns: Campaign[]): string[] {
  return [...new Set(campaigns.map((c) => c.assetCode))].sort();
}

/**
 * Filters campaigns by search query
 *
 * Searches across:
 * - campaign.title (partial match, case-insensitive)
 * - campaign.creator (case-insensitive)
 * - campaign.id (partial match, case-insensitive)
 *
 * @param campaigns - Array of campaigns to search
 * @param searchQuery - Search query string (empty string skips search)
 * @returns Filtered campaigns matching the search query
 */
export function searchCampaigns(
  campaigns: Campaign[],
  searchQuery: string,
): Campaign[] {
  // Skip filtering if search query is empty or only whitespace
  if (!searchQuery || searchQuery.trim() === "") {
    return campaigns;
  }

  // Normalize search query: lowercase and trim whitespace
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return campaigns.filter((campaign) => {
    // Check title (partial match)
    const titleMatches = campaign.title.toLowerCase().includes(normalizedQuery);

    // Check creator address (case-insensitive)
    const creatorMatches = campaign.creator.toLowerCase().includes(normalizedQuery);

    // Check campaign ID (partial match, case-insensitive)
    const idMatches = campaign.id.toLowerCase().includes(normalizedQuery);

    // Match if any field matches
    return titleMatches || creatorMatches || idMatches;
  });
}

/**
 * Pure function that applies asset code, search, and status predicates to a campaign list.
 * Pass "" as assetCode or status to skip that filter.
 * Pass "" as searchQuery to skip search.
 *
 * Filter composition (AND logic):
 * - Must match search query (if provided)
 * - AND must match asset code (if provided)
 * - AND must match status (if provided)
 */
export function applyFilters(
  campaigns: Campaign[],
  assetCode: string,
  status: string,
  searchQuery: string = "",
): Campaign[] {
  // Apply filters in sequence
  let filtered = searchCampaigns(campaigns, searchQuery);

  filtered = filtered.filter((c) => {
    const matchesAsset = assetCode === "" || c.assetCode === assetCode;
    const matchesStatus = status === "" || c.progress.status === status;
    return matchesAsset && matchesStatus;
  });

  return filtered;
}
