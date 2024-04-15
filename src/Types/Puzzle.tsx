export interface Puzzle {
  puzzleid: string;
  fen: string;
  rating: number;
  ratingDeviation: number;
  moves: string[];
  themes: string[];
}
