export interface DailyProgress {
  pages: number[];
  habits: Record<string, boolean>;
}
export interface ZaadState {
  days: Record<string, DailyProgress>;
  counter: number;
  theme: "dark" | "light";
  lang: "ar" | "en";
  startPage: number;
}
export type SupportedLocale = ZaadState["lang"];
