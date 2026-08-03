import type { Book } from "./types";
import { mockReaderBook } from "./mock";
import type { ReadingProgress, ReadingProgressChange } from "./progressSync";

type PendingPagePlacement = "end" | "start" | null;
type PendingChunkProgressSnap = "floor" | "nearest";
export type ReaderChange = ReadingProgressChange;
type ReaderChangeListener = (change: ReaderChange) => void;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export class Reader {
  private columnCount: number = 1;
  private currentChunkIndex: number = 0;
  private currentPageIndex: number = 0;
  private isBookEndReachedValue: boolean = false;
  private readonly listeners = new Set<ReaderChangeListener>();
  private pageCount: number = 1;
  private pendingChunkProgress: number | null = null;
  private pendingChunkProgressSnap: PendingChunkProgressSnap = "floor";
  private pendingPagePlacement: PendingPagePlacement = null;
  private visibleColumns: number = 1;
  private readonly book: Book;
  private readonly totalExtent: number;

  constructor(book: Book) {
    this.book = book;

    const lastChunk = this.book.chunks.at(-1);

    this.totalExtent = lastChunk ? lastChunk.startExtent + lastChunk.extent : 0;
  }

  get currentChunk() {
    return this.book.chunks[this.currentChunkIndex];
  }

  get pages() {
    return this.pageCount;
  }

  get chunks() {
    return this.book.chunks.length;
  }

  get currentPage() {
    return this.currentPageIndex + 1;
  }

  get currentChunkNumber() {
    return this.currentChunkIndex + 1;
  }

  get currentChunkProgress() {
    if (this.isBookEndReachedValue) {
      return 100;
    }

    const currentColumnIndex = Math.min(
      this.currentPageIndex * this.visibleColumns,
      this.columnCount - 1,
    );

    return (currentColumnIndex / this.columnCount) * 100;
  }

  get isPagePlacementPending() {
    return (
      this.pendingChunkProgress !== null || this.pendingPagePlacement !== null
    );
  }

  get isBookEndReached() {
    return this.isBookEndReachedValue;
  }

  get progressPercent() {
    if (this.totalExtent === 0) {
      return 0;
    }

    const chunk = this.currentChunk;
    const chunkProgress = chunk.extent * (this.currentChunkProgress / 100);
    const readExtent = chunk.startExtent + chunkProgress;

    return clamp((readExtent / this.totalExtent) * 100, 0, 100);
  }

  get readingProgress(): ReadingProgress {
    return {
      chunkIndex: this.currentChunk.index,
      chunkProgress: this.currentChunkProgress,
    };
  }

  get debugInfo() {
    return {
      chunks: this.book.chunks.map((chunk) => ({
        extent: chunk.extent,
        index: chunk.index,
        startExtent: chunk.startExtent,
      })),
      columnCount: this.columnCount,
      currentChunkIndex: this.currentChunkIndex,
      currentChunkNumber: this.currentChunkNumber,
      currentChunkProgress: this.currentChunkProgress,
      currentPageIndex: this.currentPageIndex,
      currentPageNumber: this.currentPage,
      currentChunkExtent: this.currentChunk.extent,
      currentChunkStartExtent: this.currentChunk.startExtent,
      isBookEndReached: this.isBookEndReached,
      isPagePlacementPending: this.isPagePlacementPending,
      pageCount: this.pageCount,
      pendingChunkProgress: this.pendingChunkProgress,
      pendingChunkProgressSnap: this.pendingChunkProgressSnap,
      pendingPagePlacement: this.pendingPagePlacement,
      progressPercent: this.progressPercent,
      readingProgress: this.readingProgress,
      totalChunks: this.chunks,
      totalExtent: this.totalExtent,
      visibleColumns: this.visibleColumns,
    };
  }

  setPageCountFromTextWidth(
    textWidth: number,
    columnGap: number,
    columnWidth: number,
    visibleColumns: number,
  ) {
    this.visibleColumns = visibleColumns;
    this.columnCount = Math.max(
      1,
      Math.ceil((textWidth + columnGap) / (columnWidth + columnGap)),
    );
    this.pageCount = Math.max(1, Math.ceil(this.columnCount / visibleColumns));

    if (this.pendingChunkProgress !== null) {
      this.currentPageIndex = this.getPageIndexFromChunkProgress(
        this.pendingChunkProgress,
        this.pendingChunkProgressSnap,
      );
      this.isBookEndReachedValue =
        this.isLastChunk && this.pendingChunkProgress >= 100;
    } else if (this.pendingPagePlacement === "end") {
      this.currentPageIndex = this.pageCount - 1;
      this.isBookEndReachedValue = false;
    } else if (this.pendingPagePlacement === "start") {
      this.currentPageIndex = 0;
      this.isBookEndReachedValue = false;
    } else {
      this.currentPageIndex = Math.min(
        this.currentPageIndex,
        this.pageCount - 1,
      );
    }

    this.pendingChunkProgress = null;
    this.pendingChunkProgressSnap = "floor";
    this.pendingPagePlacement = null;
    this.emitChange();
  }

  restoreProgress(progress: ReadingProgress) {
    const chunkIndex = this.book.chunks.findIndex(
      (chunk) => chunk.index === progress.chunkIndex,
    );

    if (chunkIndex === -1) {
      return;
    }

    this.currentChunkIndex = chunkIndex;
    this.currentPageIndex = 0;
    this.isBookEndReachedValue = false;
    if (
      progress.chunkProgress >= 100 &&
      chunkIndex < this.book.chunks.length - 1
    ) {
      this.currentChunkIndex = chunkIndex + 1;
      this.pendingChunkProgress = 0;
      this.pendingPagePlacement = null;
      this.emitChange();
      return;
    }

    this.pendingChunkProgress = clamp(progress.chunkProgress, 0, 100);
    this.pendingChunkProgressSnap = "floor";
    this.pendingPagePlacement = null;
    this.emitChange();
  }

  seekProgressPercent = (progressPercent: number) => {
    if (this.totalExtent === 0 || this.book.chunks.length === 0) {
      return;
    }

    const progressExtent =
      (clamp(progressPercent, 0, 100) / 100) * this.totalExtent;

    if (progressExtent >= this.totalExtent) {
      const lastChunkIndex = this.book.chunks.length - 1;
      const isMeasuredCurrentChunk =
        this.currentChunkIndex === lastChunkIndex &&
        this.pendingChunkProgress === null &&
        this.pendingPagePlacement === null;

      this.currentChunkIndex = lastChunkIndex;
      this.currentPageIndex = 0;
      this.pendingPagePlacement = null;

      if (isMeasuredCurrentChunk) {
        this.currentPageIndex = this.pageCount - 1;
        this.isBookEndReachedValue = true;
        this.pendingChunkProgress = null;
      } else {
        this.pendingChunkProgress = 100;
        this.pendingChunkProgressSnap = "nearest";
      }

      this.emitChange();
      return;
    }

    const chunkIndex = this.book.chunks.findIndex((chunk) => {
      const chunkEndExtent = chunk.startExtent + chunk.extent;

      return (
        progressExtent >= chunk.startExtent && progressExtent < chunkEndExtent
      );
    });

    if (chunkIndex === -1) {
      return;
    }

    const chunk = this.book.chunks[chunkIndex];
    const chunkProgress =
      ((progressExtent - chunk.startExtent) / chunk.extent) * 100;

    const isMeasuredCurrentChunk =
      this.currentChunkIndex === chunkIndex &&
      this.pendingChunkProgress === null &&
      this.pendingPagePlacement === null;

    this.currentChunkIndex = chunkIndex;
    this.currentPageIndex = 0;
    this.isBookEndReachedValue = false;
    this.pendingPagePlacement = null;

    if (isMeasuredCurrentChunk) {
      this.currentPageIndex = this.getPageIndexFromChunkProgress(
        chunkProgress,
        "nearest",
      );
      this.pendingChunkProgress = null;
    } else {
      this.pendingChunkProgress = chunkProgress;
      this.pendingChunkProgressSnap = "nearest";
    }

    this.emitChange();
  };

  nextPage = () => {
    this.isBookEndReachedValue = false;

    if (this.currentPageIndex < this.pageCount - 1) {
      this.currentPageIndex++;
      this.emitChange();
      return;
    }

    if (this.isLastChunk) {
      this.isBookEndReachedValue = true;
      this.emitChange();
      return;
    }

    this.incrementChunkIndex();
  };

  previousPage = () => {
    if (this.isBookEndReachedValue) {
      this.isBookEndReachedValue = false;
      this.emitChange();
      return;
    }

    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.emitChange();
      return;
    }

    this.decrementChunkIndex();
  };

  incrementChunkIndex = () => {
    if (this.currentChunkIndex < this.book.chunks.length - 1) {
      this.currentChunkIndex++;
      this.currentPageIndex = 0;
      this.isBookEndReachedValue = false;
      this.pendingPagePlacement = "start";
      this.emitChange();
    }
  };

  decrementChunkIndex = () => {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.currentPageIndex = 0;
      this.isBookEndReachedValue = false;
      this.pendingPagePlacement = "end";
      this.emitChange();
    }
  };

  onChange(listener: ReaderChangeListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private get isLastChunk() {
    return this.currentChunkIndex === this.book.chunks.length - 1;
  }

  private getPageIndexFromChunkProgress(
    chunkProgress: number,
    snap: PendingChunkProgressSnap,
  ) {
    if (chunkProgress >= 100) {
      return this.pageCount - 1;
    }

    const exactColumnIndex = (chunkProgress / 100) * this.columnCount;
    const columnIndex =
      snap === "nearest"
        ? Math.round(exactColumnIndex)
        : Math.floor(exactColumnIndex);
    const pageIndex = Math.floor(columnIndex / this.visibleColumns);

    return clamp(pageIndex, 0, this.pageCount - 1);
  }

  private emitChange() {
    const change = {
      isPagePlacementPending: this.isPagePlacementPending,
      readingProgress: this.readingProgress,
    };

    this.listeners.forEach((listener) => listener(change));
  }
}

export const mockReader = new Reader(mockReaderBook);
