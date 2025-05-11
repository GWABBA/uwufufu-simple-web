import { Worldcup } from './worldcup.dtos';

export interface CreateStartedGameDto {
  gameId: number;
  roundsOf: number;
}

interface Game {
  id: number;
  title: string;
}

export interface StartedGame {
  id: number;
  game: Game;
  roundsOf: number;
  status: string;
}

export interface Selection {
  id: number;
  name: string;
  isVideo: boolean;
  videoSource: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  resourceUrl: string;
}

export interface Match {
  id: number;
  roundsOf: number;
  selection1: Selection;
  selection2: Selection;
  winnerId: number;
}

export interface StartedGameWithGameResponseDto {
  id: number;
  status: string;
  roundsOf: number;
  game: Worldcup;
}

export interface StartedGameResponseDto {
  startedGame: StartedGame;
  previousMatch: Match;
  match: Match;
  matchNumberInRound: number;
}

export interface StartedGameResultDto {
  startedGameId: number;
  resultImage: string;
  status: string;
  game: Worldcup;
  roundsOf: number;
  createdAt: string;
}

export interface PickSelectionDto {
  startedGameId: number;
  matchId: number;
  pickedSelectionId: number;
}

export interface AddResultImageToStartedGameDto {
  startedGameId: number;
  imageUrl: string;
}
