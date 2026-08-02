import type { ReaderState } from "../model/types";

type PageControlsProps = {
  onNextPage: () => void;
  onPreviousPage: () => void;
  readerState: ReaderState;
};

export function PageControls({
  onNextPage,
  onPreviousPage,
  readerState,
}: PageControlsProps) {
  const isFirstPage =
    readerState.currentPage === 1 && readerState.currentChunk === 1;
  const isLastPage =
    readerState.currentPage === readerState.pages &&
    readerState.currentChunk === readerState.chunks;

  return (
    <div className="reader-controls reader-controls-page">
      <button type="button" disabled={isFirstPage} onClick={onPreviousPage}>
        Назад
      </button>
      <button type="button" disabled={isLastPage} onClick={onNextPage}>
        Вперед
      </button>
      <span className="reader-controls-progress">
        {Math.round(readerState.progressPercent)}%
      </span>
    </div>
  );
}
