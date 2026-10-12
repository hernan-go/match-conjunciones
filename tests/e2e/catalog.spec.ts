import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import raw from "../../src/data/catalog.json" with { type: "json" };
import type { Catalog } from "../../src/domain/types";
const catalog = raw as unknown as Catalog;
import { exploreBooks } from "../../src/domain/explore";

for (const width of [320, 390, 768, 1440])
  test(`Catálogo y menú responsive ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    await page.goto("/evento/");
    await expect(page).toHaveTitle("Match Noveduc · Noveduc Rosario");
    await expect(page.locator("header .wordmark-sub")).toHaveText("ROSARIO");
    await expect(page.locator(".privacy-note")).toContainText(
      "Sin respuestas incorrectas.",
    );
    await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
    const menu = page.getByRole("dialog");
    const topics = catalog.topics.filter((topic) => topic.enabled);
    expect(await menu.locator(".menu-option").allTextContents()).toEqual([
      ...topics.map((topic) => `${topic.shortLabel}›`),
      "☷ Lista completa›",
    ]);
    await expect(menu.getByRole("searchbox")).toHaveCount(0);
    expect(
      await menu.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    ).toBe("rgb(255, 255, 255)");
    for (const button of await menu.getByRole("button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
    if (width === 390)
      await page.screenshot({
        path: "artifacts/fase3-menu-390.png",
        fullPage: true,
      });
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Abrir menú del catálogo" }),
    ).toBeFocused();
    for (const topic of topics) {
      await page
        .getByRole("button", { name: "Abrir menú del catálogo" })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: topic.shortLabel, exact: true })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        topic.shortLabel,
      );
      await expect(page.getByRole("searchbox")).toHaveCount(0);
      await expect(page.locator(".book-card")).toHaveCount(
        exploreBooks(catalog, topic.id).length,
      );
      expect(await page.locator(".book-card h2").allTextContents()).toEqual(
        exploreBooks(catalog, topic.id).map((book) => book.title),
      );
      await expect(page.locator(".book-card a")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width === 390 && topic === topics[0])
        await page.screenshot({ path: "artifacts/fase3-category-390.png" });
      await page.getByRole("button", { name: "Volver al match" }).click();
    }
    await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Lista completa" })
      .click();
    await expect(page.locator(".book-card")).toHaveCount(80);
    const ids = await page
      .locator(".book-card")
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute("aria-labelledby")),
      );
    expect(new Set(ids).size).toBe(80);
    const search = page.getByRole("searchbox", {
      name: "Buscar por título, autor o ISBN",
    });
    for (const query of [
      "PRACTICAS",
      "prácticas",
      "STOLKINER",
      catalog.books.find((book) => book.isbn)!.isbn!.replace(/[\s-]/g, ""),
    ]) {
      await search.fill(query);
      expect(await page.locator(".book-card h2").allTextContents()).toEqual(
        exploreBooks(catalog, undefined, query).map((book) => book.title),
      );
    }
    await search.fill("NoExisteEsteLibro999");
    await expect(page.locator(".book-card")).toHaveCount(0);
    await expect(page.getByText(/No encontramos libros/)).toBeVisible();
    await page.getByRole("button", { name: "Limpiar", exact: true }).click();
    await expect(search).toHaveValue("");
    await expect(search).toBeFocused();
    await expect(page.locator(".book-card")).toHaveCount(80);
    if (width === 390)
      await page.screenshot({ path: "artifacts/fase3-all-390.png" });
  });

test("El catálogo conserva modalidad, orden, pregunta y respuestas del match", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Elegir una temática" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Empezar mi match" }).click();
  const first = await page.locator(".quiz h1").textContent();
  await page.locator(".answer-tile").nth(1).click();
  const firstAnswer = await page.locator("input:checked").getAttribute("value");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.locator(".answer-tile").nth(2).click();
  const second = await page.locator(".quiz h1").textContent();
  const secondAnswer = await page
    .locator("input:checked")
    .getAttribute("value");
  const mode = await page.locator(".quiz-meta .eyebrow").textContent();
  for (const name of [catalog.topics[1].shortLabel, "Lista completa"]) {
    await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name, exact: true })
      .click();
    await page.getByRole("button", { name: "Volver al match" }).click();
    await expect(page.locator(".quiz h1")).toHaveText(second!);
    await expect(page.locator("input:checked")).toHaveValue(secondAnswer!);
    await expect(page.locator(".quiz-meta .eyebrow")).toHaveText(mode!);
    await expect(
      page.getByText("Pregunta 2 de 10", { exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await expect(page.locator(".quiz h1")).toHaveText(first!);
  await expect(page.locator("input:checked")).toHaveValue(firstAnswer!);
});

test("Menú y explorador: accesibilidad, texto 200%, teclado y tacto", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
    hasTouch: true,
    isMobile: true,
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4174/");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await page.getByRole("button", { name: "Abrir menú del catálogo" }).tap();
  const audit = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  await audit();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lista completa" })
    .tap();
  await audit();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Volver al match" }).tap();
  await expect(
    page.getByRole("heading", { name: /Tu próxima lectura/ }),
  ).toBeVisible();
  await context.close();
});
