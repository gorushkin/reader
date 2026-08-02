import type { ReactNode, RefObject } from "react";
import {
  COLUMN_GAP,
  CONTENT_HEIGHT,
  READER_HEIGHT,
  READER_PADDING,
  type ReaderLayout,
} from "../model/layout";

type BookContentProps = {
  content: ReactNode;
  contentOffset: number;
  contentRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  readerLayout: ReaderLayout;
};

export function BookContent({
  content,
  contentOffset,
  contentRef,
  frameRef,
  readerLayout,
}: BookContentProps) {
  return (
    <div
      ref={frameRef}
      className="reader-frame"
      style={{
        height: READER_HEIGHT,
        padding: READER_PADDING,
      }}
    >
      <div
        className="reader-viewport"
        style={{
          width: readerLayout.contentWidth,
          height: CONTENT_HEIGHT,
        }}
      >
        <div
          ref={contentRef}
          className="content"
          style={{
            width: readerLayout.contentWidth,
            height: CONTENT_HEIGHT,
            columnWidth: readerLayout.columnWidth,
            columnGap: COLUMN_GAP,
            left: contentOffset,
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
