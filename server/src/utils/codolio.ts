import type { CodolioResponse } from "../types/codolio.js";

const CODOLIO_URL =
  "https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet";

export const fetchCodolioSheet = async (): Promise<CodolioResponse> => {
  const response = await fetch(CODOLIO_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch Codolio sheet");
  }

  return response.json() as Promise<CodolioResponse>;
};
