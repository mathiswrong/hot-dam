export interface AssetComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface AssetMetadata {
  id: string;
  path: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  boards: string[];
  comments: AssetComment[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  folderPath?: string;
  order?: number;
  filters: {
    tagsAny?: string[];
    fileTypes?: string[];
  };
  layout: {
    view: "grid";
    sort: { by: "createdAt" | "updatedAt" | "title"; direction: "asc" | "desc" };
  };
  coverAssetId?: string | null;
}

export interface ShareLink {
  id: string;
  type: "board" | "asset";
  targetId: string;
  createdAt: string;
  permissions: {
    allowDownload: boolean;
    allowComments: boolean;
  };
  titleOverride?: string;
  expiresAt?: string | null;
}

export interface WorkspaceSettings {
  name: string;
  baseFolder: string;
  logoUrl?: string;
}

export interface DropboxFile {
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
  ".tag": "file" | "folder";
  client_modified?: string;
  server_modified?: string;
  size?: number;
}
