export interface Message {
  text: string;
  source: "user" | "system";
  timestamp: number;
}
