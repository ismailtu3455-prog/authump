export type Plan = "FREE" | "PRO" | "PRO_PLUS";
export type PlaylistStatus = "ACTIVE" | "EXPIRED" | "CONSUMED";

export type PricingCatalogItem = {
  id: Plan;
  label: string;
  monthlyPrice: string;
  storageQuotaBytes: number;
  uploadLimitBytes: number;
  maxRetentionDays: number;
  activeLinksLimit: number | null;
  allowsMultiUse: boolean;
  defaultOneTime: boolean;
  description: string;
};

export type User = {
  id: string;
  email: string;
  plan: Plan;
  storageUsedBytes: number;
  quotaBytes: number;
  uploadLimitBytes: number;
  maxRetentionDays: number;
  activeLinksLimit: number | null;
  allowsMultiUse: boolean;
  pricingCatalog: PricingCatalogItem[];
};

export type Playlist = {
  id: string;
  userId: string;
  originalName: string;
  filePath: string;
  sizeBytes: number;
  isOneTime: boolean;
  downloadCount: number;
  expiresAt: string;
  status: PlaylistStatus;
  surchargeCents: number;
  createdAt: string;
  updatedAt: string;
  shareUrl?: string;
};
