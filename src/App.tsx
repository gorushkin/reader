import { useLayoutEffect, useRef, useState } from "react";
import { mockReader } from "./reader";
import {
  BookContent,
  ChunkControls,
  COLUMN_GAP,
  DEFAULT_FRAME_WIDTH,
  getReaderLayout,
  PageControls,
  type ReaderState,
} from "./widgets/book-reader";
import "./App.css";

const getReaderState = (): ReaderState => ({
  chunks: mockReader.chunks,
  currentChunk: mockReader.currentChunkNumber,
  currentPage: mockReader.currentPage,
  pages: mockReader.pages,
});

function App() {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [readerState, setReaderState] = useState(getReaderState);

  const [readerLayout, setReaderLayout] = useState(() =>
    getReaderLayout(DEFAULT_FRAME_WIDTH),
  );

  const contentOffset = -(readerState.currentPage - 1) * readerLayout.pageStep;

  useLayoutEffect(() => {
    const frameElement = frameRef.current;

    if (!frameElement) {
      return;
    }

    const updateLayout = () => {
      setReaderLayout(getReaderLayout(frameElement.clientWidth));
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(frameElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      return;
    }

    mockReader.setPageCountFromTextWidth(
      contentElement.scrollWidth,
      readerLayout.pageStep,
      COLUMN_GAP,
    );
    setReaderState(getReaderState());
  }, [readerLayout, readerState.currentChunk]);

  const handlePreviousPage = () => {
    mockReader.previousPage();
    setReaderState(getReaderState());
  };

  const handleNextPage = () => {
    mockReader.nextPage();
    setReaderState(getReaderState());
  };

  const handlePreviousChunk = () => {
    mockReader.decrementChunkIndex();
    setReaderState(getReaderState());
  };

  const handleNextChunk = () => {
    mockReader.incrementChunkIndex();
    setReaderState(getReaderState());
  };

  return (
    <main className="app">
      <BookContent
        content={mockReader.currentMarkup}
        contentOffset={contentOffset}
        contentRef={contentRef}
        frameRef={frameRef}
        readerLayout={readerLayout}
      />
      <PageControls
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        readerState={readerState}
      />
      <ChunkControls
        onNextChunk={handleNextChunk}
        onPreviousChunk={handlePreviousChunk}
        readerState={readerState}
      />
    </main>
  );
}

export default App;
