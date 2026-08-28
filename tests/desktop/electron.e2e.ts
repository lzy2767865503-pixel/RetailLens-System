import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { _electron as electron, expect, test } from "@playwright/test";

test("secure desktop data survives a real restart and can be cleared", async () => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  const userDataDirectory = await mkdtemp(
    path.join(tmpdir(), "retaillens-e2e-")
  );
  const launch = () =>
    electron.launch({
      args: ["."],
      env: {
        ...process.env,
        NODE_ENV: "production",
        RETAILLENS_E2E: "1",
        RETAILLENS_E2E_USER_DATA_DIR: userDataDirectory,
        OPENAI_API_KEY: ""
      }
    });

  let desktop = await launch();

  try {
    const firstPage = await desktop.firstWindow();
    const nativeWindow = await desktop.browserWindow(firstPage);
    await nativeWindow.evaluate((window) => window.setSize(1024, 768));
    firstPage.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await expect(firstPage).toHaveTitle(
      "Retail Decision Studio by LAI ZEYU"
    );
    await expect(firstPage.locator("#root")).toContainText(
      "Retail Decision Studio"
    );
    await expect(firstPage.locator("footer")).toContainText(
      "LAI ZEYU（来泽宇）"
    );
    await expect(
      firstPage.getByTestId("open-about-privacy")
    ).toBeVisible();
    await expect(firstPage.locator("h1")).toBeVisible();
    await expect(
      firstPage.evaluate(
        () =>
          typeof (
            window as typeof window & { process?: unknown }
          ).process
      )
    ).resolves.toBe("undefined");
    await expect(
      firstPage.evaluate(async () => {
        const response = await fetch("/api/health");
        return response.ok;
      })
    ).resolves.toBe(true);

    await firstPage.getByRole("button", { name: "载入示例" }).click();
    await firstPage.locator(".step-button").nth(8).click();
    await firstPage
      .locator(".bottom-action-bar .button.primary")
      .click();
    await expect(firstPage.locator(".report-shell")).toContainText(
      "74.3 / 100"
    );
    await firstPage.getByRole("button", { name: "English" }).click();
    await firstPage.evaluate(() => {
      window.localStorage.setItem(
        "retaillens.openai-settings",
        JSON.stringify({ version: 1, model: "gpt-5" })
      );
    });

    await expect(
      firstPage.evaluate(() => {
        const draft = window.localStorage.getItem(
          "retaillens.business-draft"
        );
        return {
          draftVersion: draft
            ? (JSON.parse(draft) as { version?: unknown }).version
            : null,
          locale: window.localStorage.getItem("retaillens.locale"),
          model: window.localStorage.getItem(
            "retaillens.openai-settings"
          )
        };
      })
    ).resolves.toEqual({
      draftVersion: 2,
      locale: "en",
      model: JSON.stringify({ version: 1, model: "gpt-5" })
    });

    await desktop.close();
    desktop = await launch();

    const secondPage = await desktop.firstWindow();
    secondPage.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await expect(
      secondPage.evaluate(() => ({
        draft: window.localStorage.getItem(
          "retaillens.business-draft"
        ),
        locale: window.localStorage.getItem("retaillens.locale"),
        model: window.localStorage.getItem(
          "retaillens.openai-settings"
        )
      }))
    ).resolves.toMatchObject({
      locale: "en",
      model: JSON.stringify({ version: 1, model: "gpt-5" })
    });
    await expect(
      secondPage.getByRole("button", { name: "English" })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      secondPage.evaluate(
        () =>
          window.localStorage.getItem(
            "retaillens.business-draft"
          ) !== null
      )
    ).resolves.toBe(true);

    await secondPage.getByTestId("open-about-privacy").click();
    await expect(
      secondPage.locator(".about-privacy-dialog")
    ).toBeVisible();
    await expect(
      secondPage.locator(".about-privacy-dialog")
    ).toContainText("LAI ZEYU（来泽宇）");

    secondPage.once("dialog", (dialog) => dialog.accept());
    await secondPage.getByTestId("clear-local-data").click();
    await expect(
      secondPage.locator(".clear-status.is-cleared")
    ).toBeVisible();
    await expect(
      secondPage.evaluate(() => ({
        draft: window.localStorage.getItem(
          "retaillens.business-draft"
        ),
        model: window.localStorage.getItem(
          "retaillens.openai-settings"
        ),
        locale: window.localStorage.getItem("retaillens.locale")
      }))
    ).resolves.toEqual({ draft: null, model: null, locale: "en" });

    const screenshotPath = process.env.RETAILLENS_QA_SCREENSHOT;
    if (screenshotPath) {
      await secondPage.screenshot({
        path: screenshotPath,
        fullPage: false
      });
    }

    expect(consoleErrors).toEqual([]);
  } finally {
    await desktop.close().catch(() => undefined);
    await rm(userDataDirectory, { recursive: true, force: true });
  }
});
