/// <reference lib="webworker" />

import { aggregateVisits } from "./feature1-aggregation";
import type { AiVisit } from "./types";

self.addEventListener("message", (event: MessageEvent<AiVisit[]>) => {
  try {
    const visits = event.data;
    const result = aggregateVisits(visits);
    self.postMessage({ type: "SUCCESS", payload: result });
  } catch (error) {
    self.postMessage({ type: "ERROR", error: String(error) });
  }
});
