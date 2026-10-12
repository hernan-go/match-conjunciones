import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

for (const [width, height] of [
  [320, 568],
  [375, 667],
  [390, 844],
  [768, 1024],
]) {
  test(`Inicio y navegación ergonómica ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/evento/");
    await page.mouse.move(0, 0);
    await expect(page.locator(".panel-heading h2")).toHaveText(
      "¿Por dónde iniciamos?",
    );
    await expect(page.locator(".entry-panel .section-index")).toHaveCount(0);
    expect(
      await page
        .locator(".panel-heading h2")
        .evaluate((el) => getComputedStyle(el).fontFamily),
    ).toBe(
      await page
        .locator(".hero h1")
        .evaluate((el) => getComputedStyle(el).fontFamily),
    );
    expect(
      await page
        .locator(".entry-panel")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(232, 221, 195)");
    for (let index = 0; index < 2; index++) {
      const button = page.locator(".mode-button").nth(index);
      expect(
        await button.evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe("rgb(255, 255, 255)");
      await expect(button.locator("img")).toHaveAttribute(
        "src",
        new RegExp(`ui/book${index + 1}.svg$`),
      );
      expect(
        await button.locator("img").evaluate((el) => {
          const img = el as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      ).toBe(true);
      const icon = (await button.locator("img").boundingBox())!;
      expect(icon.height).toBe(36);
      expect(icon.width / icon.height).toBeCloseTo(0.8, 1);
      const action = button.locator(".mode-action");
      expect(
        await action.evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe("rgb(17, 17, 17)");
      expect(
        await action.evaluate((el) => getComputedStyle(el).borderRadius),
      ).toBe("8px");
      expect(await action.evaluate((el) => getComputedStyle(el).color)).toBe(
        "rgb(255, 255, 255)",
      );
      await expect(button.locator("button")).toHaveCount(0);
      const file = `book${index + 1}.svg`;
      await expect(
        (await page.request.get(`/evento/ui/${file}`)).body(),
      ).resolves.toEqual(await readFile(`assets-private/ui/${file}`));
    }
    expect(
      await page
        .locator(".editorial-note")
        .evaluate((el) => getComputedStyle(el).textAlign),
    ).toBe("center");
    await page.screenshot({
      path: `artifacts/ergonomics-home-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Elegir una temática" }).click();
    await page.mouse.move(0, 0);
    for (const tile of await page.locator(".topic-tile").all()) {
      expect(
        await tile.evaluate((el) => getComputedStyle(el).backgroundColor),
      ).toBe("rgb(255, 255, 255)");
      expect(
        await tile.evaluate((el) => getComputedStyle(el).borderColor),
      ).toBe("rgb(133, 133, 128)");
    }
    const tiles = await page
      .locator(".topic-tile")
      .evaluateAll((elements) =>
        elements.map((el) => ({
          top: el.getBoundingClientRect().top,
          bottom: el.getBoundingClientRect().bottom,
        })),
      );
    const firstRow = tiles.filter((tile) => tile.top === tiles[0].top);
    const nextRow = tiles.find((tile) => tile.top > tiles[0].top)!;
    expect(
      nextRow.top - Math.max(...firstRow.map((tile) => tile.bottom)),
    ).toBeGreaterThanOrEqual(10);
    await page.screenshot({
      path: `artifacts/correction-topics-${width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Elegir una temática" }).click();
    await page.getByRole("button", { name: "Sorprendeme" }).click();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(audit.violations.map((item) => item.id)).toEqual([]);
    for (let index = 0; index < 10; index++) {
      const answer = (await page.locator(".answer-tile").last().boundingBox())!;
      const navigation = (await page
        .locator(".quiz-navigation")
        .boundingBox())!;
      expect(navigation.y - answer.y - answer.height).toBeGreaterThanOrEqual(
        40,
      );
      for (const circle of await page.locator(".circle").all()) {
        const box = (await circle.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(48);
        expect(box.height).toBeGreaterThanOrEqual(48);
        expect(
          await circle.evaluate((el) => getComputedStyle(el).backgroundColor),
        ).toBe("rgb(230, 58, 46)");
        expect(
          await circle.evaluate((el) => getComputedStyle(el).borderRadius),
        ).toBe("10px");
        await expect(circle.locator("svg")).toHaveCount(1);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (!index)
        await page.screenshot({
          path: `artifacts/ergonomics-quiz-${width}.png`,
          fullPage: true,
        });
      await page.locator(".answer-tile").first().click();
      await page
        .getByRole("button", {
          name: index === 9 ? "Ver mis resultados" : "Continuar",
          exact: true,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Tu match literario." }),
    ).toBeVisible();
  });
}
