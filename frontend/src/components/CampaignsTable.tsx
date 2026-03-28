

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";

import { Campaign } from "../types/campaign";
import { EmptyState } from "./EmptyState";
import { AssetFilterDropdown } from "./AssetFilterDropdown";

interface CampaignsTableProps {
  campaigns: Campaign[];
  selectedCampaignId: string | null;
  onSelect: (campaignId: string) => void;
  isLoading?: boolean;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
}

function formatTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString();
}

export function CampaignsTable({
  campaigns,
  selectedCampaignId,
  onSelect,
  isLoading,
  selectedStatus,
  onStatusChange,
}: CampaignsTableProps) {
  const [selectedAssetCode, setSelectedAssetCode] = useState<string>("");

  const distinctAssetCodes = useMemo(() => {
    const codes = campaigns.map((c) => c.assetCode);
    return Array.from(new Set(codes)).sort();
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (!selectedAssetCode) return campaigns;
    return campaigns.filter((c) => c.assetCode === selectedAssetCode);
  }, [campaigns, selectedAssetCode]);

  const isEmpty = campaigns.length === 0;
  
  const statusFilteredCampaigns = useMemo(() => {
    if (!selectedStatus || selectedStatus === "all") return filteredCampaigns;
    return filteredCampaigns.filter((c) => c.progress.status === selectedStatus);
  }, [filteredCampaigns, selectedStatus]);


  if (campaigns.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={LayoutGrid}
        title="Campaign board"
        message="No campaigns yet. Create the first vault to make this board active."
      />
    );
  }

  return (
    <section className="card">
      <div className="section-heading">
        <h2>Campaign board</h2>
        {isEmpty ? (
          <p className="muted">
            No campaigns yet. Create the first vault to make this board active.
          </p>
        ) : (
          <p className="muted">
            Monitor progress and open one campaign at a time in the action
            panel.
          </p>
        )}
      </div>

      <div className="board-controls">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <AssetFilterDropdown
            options={distinctAssetCodes}
            value={selectedAssetCode}
            onChange={setSelectedAssetCode}
            disabled={isEmpty}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={selectedStatus ?? 'all'}
              onChange={(e) => onStatusChange?.(e.target.value)}
              disabled={isEmpty}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="claimed">Claimed</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>
      </div>
      {!isEmpty && statusFilteredCampaigns.length === 0 ? (
        <p className="muted">No campaigns match the current filters.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Creator</th>
                <th>Funding</th>
                <th>Status</th>
                <th>Deadline</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {statusFilteredCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <div className="stacked">
                      <strong>{campaign.title}</strong>
                      <span className="muted">#{campaign.id}</span>
                    </div>
                  </td>
                  <td className="mono">{campaign.creator.slice(0, 8)}...</td>
                  <td>
                    <div className="progress-copy">
                      {campaign.pledgedAmount} / {campaign.targetAmount}{" "}
                      {campaign.assetCode}
                    </div>
                    <div className="progress-bar" aria-hidden>
                      <div
                        style={{
                          width: `${Math.min(campaign.progress.percentFunded, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="muted">
                      {campaign.progress.percentFunded}% funded
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${campaign.progress.status}`}>
                      {campaign.progress.status}
                    </span>
                  </td>
                  <td className="stacked">
                    <span>{formatTimestamp(campaign.deadline)}</span>
                    <span className="muted">
                      {campaign.progress.hoursLeft}h left
                    </span>
                  </td>
                  <td>
                    <button
                      className={
                        selectedCampaignId === campaign.id
                          ? "btn-secondary"
                          : "btn-ghost"
                      }
                      type="button"
                      onClick={() => onSelect(campaign.id)}
                    >
                      {selectedCampaignId === campaign.id ? "Selected" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
