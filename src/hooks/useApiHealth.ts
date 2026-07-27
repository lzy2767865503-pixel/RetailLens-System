import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "../api";

export type ApiHealthState =
  | { status: "loading" }
  | { status: "ready"; value: HealthResponse }
  | { status: "offline" };

export function useApiHealth(): ApiHealthState {
  const [state, setState] = useState<ApiHealthState>({
    status: "loading"
  });

  useEffect(() => {
    const controller = new AbortController();

    getHealth(controller.signal)
      .then((value) => setState({ status: "ready", value }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ status: "offline" });
        }
      });

    return () => controller.abort();
  }, []);

  return state;
}
