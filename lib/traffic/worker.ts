/// <reference lib="webworker" />

import { aggregateTraffic } from "./aggregateTraffic";
import type { AiVisit } from "./trafficTypes";

self.addEventListener("message", (event: MessageEvent<AiVisit[]>) => {
  try {
    const visits = event.data;
    const result = aggregateTraffic(visits);
    self.postMessage({ type: "SUCCESS", payload: result });
  } catch (error) {
    self.postMessage({ type: "ERROR", error: String(error) });
  }
});
