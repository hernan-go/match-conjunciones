import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function finish(page: Page) {
  for (let i = 0; i < 10; i++) {
    await page.locator(".answer-tile").first().click();
    const next = page.getByRole("button", {
      name: i === 9 ? "Ver mis resultados" : "Continuar",
      exact: true,
    });
    await expect(next).toBeEnabled();
    if (i === 9)
      await next.evaluate((button: HTMLButtonElement) => {
        button.click();
        button.click();
        button.click();
      });
    else await next.click();
  }
  await expect(page.locator(".results .book-card")).toHaveCount(5);
}

test("contadores: visitas, recarga, catálogo, partidas y ráfagas sin duplicación", async ({
  page,
  browser,
}) => {
  const totals = { visitors: 0, matchComplete: 0 };
  const seen = new Set<string>();
  const posted: { type: string; id: string }[] = [];
  let gets = 0;
  const route = async (p: Page) =>
    p.route("**/stats.php", async (route) => {
      expect(new URL(route.request().url()).pathname).toBe("/evento/stats.php");
      if (route.request().method() === "POST") {
        const event = route.request().postDataJSON();
        expect(Object.keys(event).sort()).toEqual(["id", "type"]);
        posted.push(event);
        if (!seen.has(event.type + event.id)) {
          seen.add(event.type + event.id);
          if (event.type === "visit") totals.visitors++;
          else totals.matchComplete++;
        }
      } else gets++;
      await route.fulfill({ json: totals });
    });
  await route(page);
  await page.goto("/evento/");
  await expect(page.locator(".statistics dd")).toHaveText(["1", "0"]);
  const before = gets;
  await page.getByRole("button", { name: "Elegir una temática" }).click();
  await page.getByRole("button", { name: "Elegir una temática" }).click();
  expect(gets).toBe(before);
  await page.reload();
  await expect(page.locator(".statistics dd")).toHaveText(["1", "0"]);
  expect(posted.filter((e) => e.type === "visit")).toHaveLength(1);
  await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
  await expect(page.locator(".statistics")).toHaveCount(0);
  await page.getByRole("button", { name: "Lista completa" }).click();
  await expect(page.locator(".statistics")).toHaveCount(0);
  await page.getByRole("button", { name: "Volver al match" }).click();
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await page.locator(".answer-tile").first().click();
  expect(totals.matchComplete).toBe(0);
  await expect(page.locator(".statistics")).toHaveCount(0);
  await finish(page);
  await expect.poll(() => totals.matchComplete).toBe(1);
  await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
  await page.keyboard.press("Escape");
  expect(posted.filter((e) => e.type === "complete")).toHaveLength(1);
  await page.getByRole("button", { name: "Hacer otro match" }).click();
  await expect(page.locator(".statistics dd")).toHaveText(["1", "1"]);
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await finish(page);
  await expect.poll(() => totals.matchComplete).toBe(2);
  await page.reload();
  await expect(page.locator(".statistics dd")).toHaveText(["1", "2"]);
  const other = await browser.newContext({ serviceWorkers: "block" });
  const second = await other.newPage();
  await route(second);
  await second.goto("/evento/");
  await expect(second.locator(".statistics dd")).toHaveText(["2", "2"]);
  await other.close();
  expect(
    new Set(posted.filter((e) => e.type === "complete").map((e) => e.id)).size,
  ).toBe(2);
});

test("endpoint caído: guiones, juego completo y reenvío persistido con el mismo ID", async ({
  page,
}) => {
  const pending: { type: string; id: string }[] = [];
  let fail = true;
  await page.route("**/stats.php", async (route) => {
    if (route.request().method() === "POST")
      pending.push(route.request().postDataJSON());
    if (fail) await route.abort();
    else await route.fulfill({ json: { visitors: 1, matchComplete: 1 } });
  });
  await page.goto("/");
  await expect(page.locator(".statistics dd")).toHaveText(["—", "—"]);
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await finish(page);
  await expect
    .poll(() => pending.some((e) => e.type === "complete"))
    .toBe(true);
  const completed = pending.find((e) => e.type === "complete")!;
  fail = false;
  await page.reload();
  await expect(page.locator(".statistics dd")).toHaveText(["1", "1"]);
  await expect
    .poll(() => pending.filter((e) => e.type === "complete").length)
    .toBe(2);
  expect(
    pending
      .filter((e) => e.type === "complete")
      .every((e) => e.id === completed.id),
  ).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys(localStorage).filter((k) =>
            /stats-v1:(visit|complete):/.test(k),
          ).length,
      ),
    )
    .toBe(0);
});

test("worker: PHP fuera de precache, GET sin caché y POST sin interceptar", async ({
  browser,
}) => {
  const worker = await readFile("dist/sw.js", "utf8");
  const files = JSON.parse(worker.match(/const FILES = (.*);/)![1]) as string[];
  expect(files.some((f) => f.endsWith(".php"))).toBe(false);
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const result = await page.evaluate(async () => {
    const cache = await caches.open("statistics-stale-test");
    await cache.put(
      new URL("stats.php", location.href),
      Response.json({ visitors: 999, matchComplete: 999 }),
    );
    const get = await fetch("stats.php");
    const post = await fetch("stats.php", { method: "POST", body: "{}" });
    return { get: get.status, post: post.status, body: await get.json() };
  });
  expect(result).toEqual({ get: 503, post: 503, body: {} });
  await context.close();
});
