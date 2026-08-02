import { createElement, type ReactNode } from "react";
import type { Book } from "./types";
import { mockReaderBook } from "./mock";

type PendingPagePlacement = "end" | "start" | null;

export class Reader {
  private columnCount: number = 1;
  private currentChunkIndex: number = 0;
  private currentPageIndex: number = 0;
  private pageCount: number = 1;
  private pendingPagePlacement: PendingPagePlacement = null;
  private visibleColumns: number = 1;
  private readonly book: Book;
  private readonly totalExtent: number;

  constructor(book: Book) {
    this.book = book;
    const lastChunk = this.book.chunks.at(-1);
    this.totalExtent = lastChunk
      ? lastChunk.startExtent + lastChunk.extent
      : 0;
  }

  get currentChunk() {
    return this.book.chunks[this.currentChunkIndex];
  }

  get currentMarkup(): ReactNode[] {
    return this.currentChunk.content.map((block, index) => {
      if (block.type === "title") {
        return createElement("h2", { key: index }, block.content);
      }

      return createElement("p", { key: index }, block.content);
    });
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

  get progressPercent() {
    if (this.totalExtent === 0) {
      return 0;
    }

    const chunk = this.currentChunk;
    const readColumns = Math.min(
      this.currentPageIndex * this.visibleColumns + this.visibleColumns,
      this.columnCount,
    );
    const chunkProgress = chunk.extent * (readColumns / this.columnCount);
    const readExtent = chunk.startExtent + chunkProgress;

    return Math.min(100, Math.max(0, (readExtent / this.totalExtent) * 100));
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

    if (this.pendingPagePlacement === "end") {
      this.currentPageIndex = this.pageCount - 1;
    } else if (this.pendingPagePlacement === "start") {
      this.currentPageIndex = 0;
    } else {
      this.currentPageIndex = Math.min(
        this.currentPageIndex,
        this.pageCount - 1,
      );
    }

    this.pendingPagePlacement = null;
  }

  nextPage() {
    if (this.currentPageIndex < this.pageCount - 1) {
      this.currentPageIndex++;
      return;
    }

    this.incrementChunkIndex();
  }

  previousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      return;
    }

    this.decrementChunkIndex();
  }

  incrementChunkIndex() {
    if (this.currentChunkIndex < this.book.chunks.length - 1) {
      this.currentChunkIndex++;
      this.currentPageIndex = 0;
      this.pendingPagePlacement = "start";
    }
  }

  decrementChunkIndex() {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.currentPageIndex = 0;
      this.pendingPagePlacement = "end";
    }
  }
}

export const mockReader = new Reader(mockReaderBook);
