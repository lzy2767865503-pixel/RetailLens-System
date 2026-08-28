import { once } from "node:events";
import { describe, expect, it } from "vitest";
import { startServer } from "./index";

describe("RetailLens loopback server", () => {
  it("accepts an operating-system-assigned port on 127.0.0.1", async () => {
    const server = await startServer({ port: 0, log: false });

    try {
      const address = server.address();
      expect(address).not.toBeNull();
      expect(typeof address).not.toBe("string");
      if (!address || typeof address === "string") return;

      expect(address.address).toBe("127.0.0.1");
      expect(address.port).toBeGreaterThan(0);

      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/health`
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        status: "ok"
      });
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
