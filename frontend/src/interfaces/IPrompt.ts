// types/IPrompt.ts

export interface IPrompt {
  ID?: number; 
  objective: string;
  persona?: string;
  tone?: string;
  instruction?: string;
  constraint?: string;
  context?: string;
  is_using?: boolean; 
}
