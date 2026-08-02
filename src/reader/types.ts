export type BlockType = "paragraph" | "title";

export type Block = {
  type: BlockType;
  content: string;
};

export type Chunk = {
  content: Block[];
  index: number;
  extent: number;
  startExtent: number;
};

export type Book = {
  chunks: Chunk[];
  title: string;
};
