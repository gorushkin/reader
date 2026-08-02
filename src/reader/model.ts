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

  get chunks() {
    return this.book.chunks.length;
  }

  get currentPage() {
    return this.currentPageIndex + 1;
  }

  get currentChunkNumber() {
    return this.currentChunkIndex + 1;
  }

  setPageCountFromTextWidth(
    textWidth: number,
    pageStep: number,
    columnGap: number,
  ) {
    this.pageCount = Math.max(1, Math.ceil((textWidth + columnGap) / pageStep));
    this.currentPageIndex = Math.min(this.currentPageIndex, this.pageCount - 1);
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
    }
  }

  decrementChunkIndex() {
    if (this.currentChunkIndex > 0) {
      this.currentChunkIndex--;
      this.currentPageIndex = 0;
    }
  }
}

export const mockReader = new Reader(mockReaderBook);
