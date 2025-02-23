export interface Character {
  name: string;
  turnsLeft: number;
}

export interface Power {
  name: string;
  powerLeft: number;
}

export interface GameState {
  gameStarted: boolean;
  gameEnded: boolean;
  winner: number;
  currentTurn: number;
  chemicalX: { [chainSlug: number]: number };
  life: { [chainSlug: number]: number };
  characters: {
    [chainSlug: number]: {
      [characterId: number]: Character;
    }
  };
  powers: {
    [chainSlug: number]: {
      [powerId: number]: Power;
    }
  };
} 