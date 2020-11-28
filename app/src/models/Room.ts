export default interface Room {
  id: string;
  name: string;
  mode: string;
  version: string;
  url: string;
  numPlayers: number;
  maxPlayers: number;
}
