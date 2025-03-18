export interface SelectionsResponseDto {
  page: number;
  perPage: number;
  total: number;
  data: SelectionDto[];
}

export interface SelectionDto {
  id: number;
  name: string;
  isVideo: boolean;
  videoSource: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  wins: number;
  losses: number;
  finalWins: number;
  finalLosses: number;
  resourceUrl: string;
  ranking: number;
}

export interface CreateSelectionWithVideo {
  worldcupId: number;
  resourceUrl: string;
  startTime: number;
  endTime: number;
}
