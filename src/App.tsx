import { useLayoutEffect, useRef, useState } from "react";
import { mockReader } from "./reader";
import "./App.css";

const READER_HEIGHT = 720;
const READER_PADDING = 48;
const COLUMN_GAP = 40;
const READER_BORDER = 1;
const TWO_COLUMN_BREAKPOINT = 1000;
const DEFAULT_FRAME_WIDTH = 920;

const CONTENT_HEIGHT = READER_HEIGHT - READER_PADDING * 2 - READER_BORDER * 2;

const getReaderPageState = () => ({
  currentPage: mockReader.currentPage,
  pages: mockReader.pages,
});

const getReaderLayout = (frameWidth: number) => {
  const contentWidth = frameWidth - READER_PADDING * 2;
  const visibleColumns = frameWidth >= TWO_COLUMN_BREAKPOINT ? 2 : 1;
  const columnWidth =
    visibleColumns === 1
      ? contentWidth
      : (contentWidth - COLUMN_GAP) / visibleColumns;
  const pageStep = visibleColumns * (columnWidth + COLUMN_GAP);

  return {
    columnWidth,
    contentWidth,
    pageStep,
  };
};

function App() {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState(getReaderPageState);
  const [readerLayout, setReaderLayout] = useState(() =>
    getReaderLayout(DEFAULT_FRAME_WIDTH),
  );
  const contentOffset = -(pageState.currentPage - 1) * readerLayout.pageStep;

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
    setPageState(getReaderPageState());
  }, [readerLayout]);

  const handlePreviousPage = () => {
    mockReader.decrementPage();
    setPageState(getReaderPageState());
  };

  const handleNextPage = () => {
    mockReader.incrementPage();
    setPageState(getReaderPageState());
  };

  return (
    <main className="app">
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
            {mockReader.currentMarkup}
          </div>
        </div>
      </div>
      <div className="reader-controls">
        <button
          type="button"
          disabled={pageState.currentPage === 1}
          onClick={handlePreviousPage}
        >
          Назад
        </button>
        <span>
          {pageState.currentPage} / {pageState.pages}
        </span>
        <button
          type="button"
          disabled={pageState.currentPage === pageState.pages}
          onClick={handleNextPage}
        >
          Вперед
        </button>
      </div>
    </main>
  );
}

export default App;
