import { useLayoutEffect, useRef, useState } from "react";
import { mockReader } from "./reader";
import "./App.css";

const READER_WIDTH = 920;
const READER_HEIGHT = 720;
const READER_PADDING = 48;
const COLUMN_GAP = 40;
const READER_BORDER = 1;

const CONTENT_WIDTH = READER_WIDTH - READER_PADDING * 2 - READER_BORDER * 2;
const CONTENT_HEIGHT = READER_HEIGHT - READER_PADDING * 2 - READER_BORDER * 2;

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageState, setPageState] = useState(() => ({
    currentPage: mockReader.currentPage,
    pages: mockReader.pages,
  }));

  useLayoutEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      return;
    }

    mockReader.setPageCountFromTextWidth(
      contentElement.scrollWidth,
      CONTENT_WIDTH,
      COLUMN_GAP,
    );
    setPageState({
      currentPage: mockReader.currentPage,
      pages: mockReader.pages,
    });
  }, []);

  return (
    <main className="app">
      <div
        className="reader-frame"
        style={{
          width: READER_WIDTH,
          height: READER_HEIGHT,
          padding: READER_PADDING,
        }}
      >
        <div
          className="reader-viewport"
          style={{
            width: CONTENT_WIDTH,
            height: CONTENT_HEIGHT,
          }}
        >
          <div
            ref={contentRef}
            className="content"
            style={{
              width: CONTENT_WIDTH,
              height: CONTENT_HEIGHT,
              columnWidth: CONTENT_WIDTH,
              columnGap: COLUMN_GAP,
            }}
          >
            {mockReader.currentMarkup}
          </div>
        </div>
      </div>
      <div className="reader-controls">
        <button type="button">Назад</button>
        <span>
          {pageState.currentPage} / {pageState.pages}
        </span>
        <button type="button">Вперед</button>
      </div>
    </main>
  );
}

export default App;
