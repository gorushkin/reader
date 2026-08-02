export const READER_HEIGHT = 720;
export const READER_PADDING = 48;
export const COLUMN_GAP = 40;
export const READER_BORDER = 1;
export const TWO_COLUMN_BREAKPOINT = 1000;
export const DEFAULT_FRAME_WIDTH = 920;

export const CONTENT_HEIGHT =
  READER_HEIGHT - READER_PADDING * 2 - READER_BORDER * 2;

export const getReaderLayout = (frameWidth: number) => {
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
    visibleColumns,
  };
};

export type ReaderLayout = ReturnType<typeof getReaderLayout>;
