import { createElement, type ReactNode } from "react";
import type { Book } from "./types";
import { mockReaderBook } from "./mock";

export class Reader {
  private currentChunkIndex: number = 0;
  private currentPageIndex: number = 0;
  private pageCount: number = 1;
  private readonly book: Book;

  constructor(book: Book) {
    this.book = book;
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

  get currentPage() {
    return this.currentPageIndex + 1;
  }

  setPageCountFromTextWidth(
    textWidth: number,
    pageStep: number,
    columnGap: number,
  ) {
    this.pageCount = Math.max(1, Math.ceil((textWidth + columnGap) / pageStep));
    this.currentPageIndex = Math.min(this.currentPageIndex, this.pageCount - 1);
  }

  incrementPage() {
    if (this.currentPageIndex < this.pageCount - 1) {
      this.currentPageIndex++;
    }
  }

  decrementPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
  }

  incrementChunkIndex() {
    if (this.currentChunkIndex < this.book.chunks.length - 1) {
      this.currentChunkIndex++;
    }
  }

  decrementChunkIndex() {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
    }
  }
}

export const mockReader = new Reader(mockReaderBook);
