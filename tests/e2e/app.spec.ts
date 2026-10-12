import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import baseline from "../fixtures/mobile-baseline.json" with { type: "json" };
const widths = [320, 375, 390, 768, 1024, 1440];
const heights: Record<number, number> = {
  320: 568,
  375: 667,
  390: 844,
  768: 1024,
  1024: 768,
  1440: 900,
};
async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll("main *,header *")]
      .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        right: el.getBoundingClientRect().right,
        text: el.textContent?.slice(0, 65),
      })),
  }));
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(
    overflow.width + 1,
  );
}
async function finish(page: Page) {
  for (let i = 0; i < 10; i++) {
    await expect(
      page.getByText(`Pregunta ${i + 1} de 10`, { exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.locator(".answer-tile").first().click();
    const next = page.getByRole("button", {
      name: i === 9 ? "Ver mis resultados" : "Continuar",
    });
    await expect(next).toBeEnabled();
    await next.click();
  }
  await expect(
    page.getByRole("heading", { name: "Tu match literario." }),
  ).toBeVisible();
  await noOverflow(page);
}
async function images(page: Page) {
  await expect
    .poll(() =>
      page
        .locator(".book-card img")
        .evaluateAll((imgs) =>
          imgs.every(
            (img) =>
              (img as HTMLImageElement).complete &&
              (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
}
for (const width of widths)
  test(`Responsive ${width}: inicio, preguntas, resultados y recursos`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: heights[width] });
    const failures: string[] = [];
    page.on("pageerror", (e) => failures.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failures.push(r.url());
    });
    await page.goto("/evento/");
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `artifacts/${info.project.name}-home-${width}.png`,
        fullPage: true,
      });
    await noOverflow(page);
    await page.getByRole("button", { name: "Elegir una temática" }).click();
    if (width === 390)
      await page.screenshot({
        path: "artifacts/selector-390.png",
        fullPage: true,
      });
    await noOverflow(page);
    await expect(page.getByRole("radio")).toHaveCount(6);
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Empezar mi match" }).click();
    await noOverflow(page);
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: `artifacts/${info.project.name}-quiz-${width}.png`,
        fullPage: true,
      });
    }
    await finish(page);
    await images(page);
    await noOverflow(page);
    await expect(page.locator(".book-card")).toHaveCount(5);
    await expect(page.locator(".book-card a")).toHaveCount(0);
    await expect(page.locator(".book-list")).not.toContainText("LINK");
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `artifacts/${info.project.name}-results-${width}.png`,
        fullPage: true,
      });
    expect(failures).toEqual([]);
    await expect(page.locator("main")).not.toContainText(
      /\$|descuento|stock|comprar|carrito|\d+\s*%/i,
    );
    await page.getByRole("button", { name: "Hacer otro match" }).click();
    await expect(
      page.getByRole("heading", { name: /Tu próxima lectura/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Elegir una temática" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
test("Navegación, conservación, cambio de selección y protección de ráfagas", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  const heading = await page.locator(".quiz h1").innerText();
  const option = page.locator(".answer-tile");
  await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Anterior" })).toBeDisabled();
  await option.nth(0).click();
  await option.nth(1).click();
  await expect(page.locator("input:checked")).toHaveCount(1);
  const id = await page.locator("input:checked").getAttribute("value");
  await page.getByRole("button", { name: "Continuar" }).click();
  await option.first().click();
  await expect(page.getByRole("button", { name: "Anterior" })).toBeEnabled();
  await page.getByRole("button", { name: "Anterior" }).click();
  await expect(page.locator(".quiz h1")).toHaveText(heading);
  expect(await page.locator("input:checked").getAttribute("value")).toBe(id);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  await page
    .getByRole("button", { name: "Continuar" })
    .evaluate((el: HTMLButtonElement) => {
      el.click();
      el.click();
      el.click();
    });
  await expect(
    page.getByText("Pregunta 2 de 10", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  await page.getByRole("button", { name: "Anterior" }).click();
  await option.nth(2).click();
  await expect(page.locator("input:checked")).toHaveValue(
    (await option.nth(2).locator("input").getAttribute("value")) as string,
  );
});

test("Densidad móvil: ambas modalidades visibles y encabezado compacto", async ({
  page,
}) => {
  const metrics = [];
  for (const [width, height] of [
    [375, 667],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const header = (await page.locator(".masthead").boundingBox())!;
    expect(header.height).toBeGreaterThanOrEqual(56);
    expect(header.height).toBeLessThanOrEqual(72);
    const bottom =
      (await page.getByRole("button", { name: "Sorprendeme" }).boundingBox())!
        .y +
      (await page.getByRole("button", { name: "Sorprendeme" }).boundingBox())!
        .height;
    expect(bottom).toBeLessThanOrEqual(height - 48); // reserva para barras móviles
    await page.getByRole("button", { name: "Sorprendeme" }).click();
    await expect(page.locator("footer")).toHaveCount(0);
    const next = (await page.locator(".quiz-navigation").boundingBox())!;
    metrics.push({
      width,
      height,
      header: header.height,
      modeBottom: bottom,
      navigationBottom: next.y + next.height,
    });
    await noOverflow(page);
  }
  // Medidas v1 contrastadas contra el ZIP conservado, con hash en el fixture.
  await writeFile(
    "artifacts/mobile-density.json",
    JSON.stringify({ baseline390: baseline, current: metrics }, null, 2),
  );
  expect(metrics[1].header).toBeLessThan(baseline.header);
  expect(metrics[1].modeBottom).toBeLessThan(baseline.modeBottom);
});
test("Seis áreas completas respetan el filtro y permiten partidas consecutivas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await noOverflow(page);
  for (let area = 0; area < 6; area++) {
    await page.getByRole("button", { name: "Elegir una temática" }).click();
    await page.getByRole("radio").nth(area).check();
    await page.getByRole("button", { name: "Empezar mi match" }).click();
    await finish(page);
    await images(page);
    await expect(page.locator(".topic-badge")).toBeVisible();
    await page.getByRole("button", { name: "Hacer otro match" }).click();
  }
});
test("Sorprendeme termina y reinicia sin selección conservada", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await finish(page);
  await page.getByRole("button", { name: "Hacer otro match" }).click();
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await expect(
    page.getByText("Pregunta 1 de 10", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("input:checked")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
});
test("Orientación y texto 200% conservan respuestas sin desbordar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await page.locator(".answer-tile").first().click();
  const heading = await page.locator(".quiz h1").innerText();
  const id = await page.locator("input:checked").getAttribute("value");
  await page.setViewportSize({ width: 740, height: 320 });
  await expect(page.locator(".quiz h1")).toHaveText(heading);
  expect(await page.locator("input:checked").getAttribute("value")).toBe(id);
  await noOverflow(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await noOverflow(page);
  await page.getByRole("button", { name: "Continuar" }).click();
  for (let i = 1; i < 10; i++) {
    await page.locator(".answer-tile").first().click();
    const next = page.getByRole("button", {
      name: i === 9 ? "Ver mis resultados" : "Continuar",
    });
    await expect(next).toBeEnabled();
    await next.click();
    await noOverflow(page);
  }
  await images(page);
  await noOverflow(page);
  await expect(page.locator(".match-ribbon")).toHaveText("literario.");
  await page.screenshot({
    path: "artifacts/results-320-text-200.png",
    fullPage: true,
  });
});

test("Identidad oficial y apariencia clara incluso con sistema oscuro", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    ),
  ).toBe("rgb(255, 255, 255)");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
  ).toBe("light");
  const mark = page.locator(".mark");
  await expect(mark).toHaveAttribute("src", /covers\/n_portada.svg$/);
  expect(
    await mark.evaluate((el) => (el as HTMLImageElement).naturalWidth > 0),
  ).toBe(true);
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await page.locator(".answer-tile").first().click();
  await expect(page.locator(".selected .selection-indicator")).toHaveText("✓");
  await page.screenshot({
    path: "artifacts/quiz-selected-light.png",
    fullPage: true,
  });
  await finish(page);
  expect(
    await page
      .locator(".match-ribbon")
      .evaluate((el) => getComputedStyle(el).color),
  ).toBe("rgb(255, 255, 255)");
  expect(
    await page
      .locator(".match-ribbon")
      .evaluate((el) => getComputedStyle(el, "::before").backgroundColor),
  ).toBe("rgb(230, 58, 46)");
  await noOverflow(page);
});
test("Teclado, foco y objetivos táctiles", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await page.keyboard.press("Tab");
  await expect(page.locator("input[type=radio]").first()).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("input:checked")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("input:checked")).toHaveCount(1);
  for (const selector of [".answer-tile", ".circle"])
    for (const el of await page.locator(selector).all()) {
      const box = (await el.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.width).toBeGreaterThanOrEqual(48);
    }
});
test("Tap táctil emulado y carga raíz/subcarpeta", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4174/evento/");
  await page.getByRole("button", { name: "Sorprendeme" }).tap();
  await page.locator(".answer-tile").first().tap();
  await page.locator(".answer-tile").nth(1).tap();
  await expect(page.locator("input:checked")).toHaveCount(1);
  await page.getByRole("button", { name: "Continuar" }).tap();
  await expect(
    page.getByText("Pregunta 2 de 10", { exact: true }),
  ).toBeVisible();
  await context.close();
});
test("Imagen institucional válida cuando falla una imagen solicitada", async ({
  page,
}) => {
  await page.route("**/covers/*.webp", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Sorprendeme" }).click();
  await finish(page);
  await images(page);
  await expect(page.locator(".book-card img").first()).toHaveAttribute(
    "src",
    /n_portada.svg$/,
  );
  await expect(page.locator(".book-list")).not.toContainText(
    /Sin portada|Portada no disponible|Imagen no existente/,
  );
});

test("Accesibilidad WCAG AA y contraste en inicio, selección, cuestionario y resultados", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const audit = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  };
  await audit();
  await page.getByRole("button", { name: "Elegir una temática" }).click();
  await audit();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Empezar mi match" }).click();
  await page.locator(".answer-tile").first().click();
  await audit();
  await finish(page);
  await images(page);
  await audit();
});
