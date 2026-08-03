export type ReaderState = {
  chunks: number;
  currentChunk: number;
  currentPage: number;
  isBookEndReached: boolean;
  pages: number;
  progressPercent: number;
};

export type ReaderDebugInfo = {
  chunks: Array<{
    extent: number;
    index: number;
    startExtent: number;
  }>;
  columnCount: number;
  currentChunkIndex: number;
  currentChunkNumber: number;
  currentChunkProgress: number;
  currentPageIndex: number;
  currentPageNumber: number;
  currentChunkExtent: number;
  currentChunkStartExtent: number;
  isBookEndReached: boolean;
  isPagePlacementPending: boolean;
  pageCount: number;
  pendingChunkProgress: number | null;
  pendingChunkProgressSnap: "floor" | "nearest";
  pendingPagePlacement: "end" | "start" | null;
  progressPercent: number;
  readingProgress: {
    chunkIndex: number;
    chunkProgress: number;
  };
  totalChunks: number;
  totalExtent: number;
  visibleColumns: number;
};
