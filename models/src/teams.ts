export type Team = {
  patternNumber: number;
  color: number;
  name: string;
  characterId: string;
};

export const redTeam: Team = {
  color: 0xf33821,
  name: 'Red',
  patternNumber: 13,
  characterId: '727',
};
export const blueTeam: Team = {
  color: 0x223ea4,
  name: 'Blue',
  patternNumber: 24,
  characterId: '454',
};
export const greenTeam: Team = {
  color: 0x049564,
  name: 'Green',
  patternNumber: 3,
  characterId: '205',
};
export const yellowTeam: Team = {
  color: 0xf7e74d,
  name: 'Yellow',
  patternNumber: 19,
  characterId: '720',
};

export const teams = [redTeam, blueTeam, greenTeam, yellowTeam];
