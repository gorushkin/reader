import { useLayoutEffect, useRef, useState } from "react";
import { LocalReadingProgressSyncService, mockReader } from "./reader";
import {
  BookContent,
  ChunkControls,
  COLUMN_GAP,
  DEFAULT_FRAME_WIDTH,
  getReaderLayout,
  PageControls,
  ReaderDebugPanel,
  ReadingProgressSlider,
  type ReaderDebugInfo,
  type ReaderState,
} from "./widgets/book-reader";
import "./App.css";

const readingProgressSyncService = new LocalReadingProgressSyncService(
  "mock-reader-book",
);

const getReaderState = (): ReaderState => ({
  chunks: mockReader.chunks,
  currentChunk: mockReader.currentChunkNumber,
  currentPage: mockReader.currentPage,
  isBookEndReached: mockReader.isBookEndReached,
  pages: mockReader.pages,
  progressPercent: mockReader.progressPercent,
});

const getReaderDebugInfo = (): ReaderDebugInfo => mockReader.debugInfo;

function App() {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [readerState, setReaderState] = useState(() => {
    const savedProgress = readingProgressSyncService.readProgress();

    if (savedProgress) {
      mockReader.restoreProgress(savedProgress);
    }

    return getReaderState();
  });
  const [readerDebugInfo, setReaderDebugInfo] = useState(getReaderDebugInfo);

  const [readerLayout, setReaderLayout] = useState(() =>
    getReaderLayout(DEFAULT_FRAME_WIDTH),
  );
  const [isReaderLayoutMeasured, setIsReaderLayoutMeasured] = useState(false);

  const contentOffset = -(readerState.currentPage - 1) * readerLayout.pageStep;

  useLayoutEffect(() => {
    const frameElement = frameRef.current;

    if (!frameElement) {
      return;
    }

    const updateLayout = () => {
      setReaderLayout(getReaderLayout(frameElement.clientWidth));
      setIsReaderLayoutMeasured(true);
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(frameElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const unsubscribeReader = mockReader.onChange((change) => {
      setReaderState(getReaderState());
      setReaderDebugInfo(getReaderDebugInfo());
      readingProgressSyncService.syncChange(change);
    });

    return () => {
      unsubscribeReader();
    };
  }, []);

  useLayoutEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement || !isReaderLayoutMeasured) {
      return;
    }

    mockReader.setPageCountFromTextWidth(
      contentElement.scrollWidth,
      COLUMN_GAP,
      readerLayout.columnWidth,
      readerLayout.visibleColumns,
    );
  }, [isReaderLayoutMeasured, readerLayout, readerState.currentChunk]);

  return (
    <main className="app">
      <ReaderDebugPanel readerDebugInfo={readerDebugInfo} />
      <BookContent
        content={mockReader.currentChunk.content}
        contentOffset={contentOffset}
        contentRef={contentRef}
        frameRef={frameRef}
        readerLayout={readerLayout}
      />
      <ReadingProgressSlider
        onProgressCommit={mockReader.seekProgressPercent}
        progressPercent={readerState.progressPercent}
      />
      <PageControls
        onNextPage={mockReader.nextPage}
        onPreviousPage={mockReader.previousPage}
        readerState={readerState}
      />
      <ChunkControls
        onNextChunk={mockReader.incrementChunkIndex}
        onPreviousChunk={mockReader.decrementChunkIndex}
        readerState={readerState}
      />
    </main>
  );
}

export default App;
