import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import sharp from "sharp";

test.use({ serviceWorkers: "allow" });

for (const path of ["/", "/evento/"])
  test(`PWA: manifiesto, instalación y catálogo offline ${path}`, async ({
    page,
    context,
  }) => {
    await page.goto(path);
    const manifest = await (
      await page.request.get(`${path}manifest.webmanifest`)
    ).json();
    expect(manifest.name).toBe("Noveduc Rosario");
    expect(manifest.short_name).toBe("Noveduc");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    for (const icon of manifest.icons) {
      const bytes = await (await page.request.get(`${path}${icon.src}`)).body();
      const metadata = await sharp(bytes).metadata();
      expect(`${metadata.width}x${metadata.height}`).toBe(icon.sizes);
      const pixel = await sharp(bytes)
        .extract({ left: 0, top: 0, width: 1, height: 1 })
        .raw()
        .toBuffer();
      expect([...pixel]).toEqual([255, 255, 255, 255]);
    }
    await expect
      .poll(() =>
        page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      )
      .toBe(true);
    const cdp = await context.newCDPSession(page);
    await expect
      .poll(
        async () =>
          (await cdp.send("Page.getInstallabilityErrors")).installabilityErrors,
      )
      .toEqual([]);
    await context.setOffline(true);
    await page.reload();
    await page.getByRole("button", { name: "Abrir menú del catálogo" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Lista completa" })
      .click();
    await expect(page.locator(".book-card")).toHaveCount(80);
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
    await page.getByRole("searchbox").fill("Stolkiner");
    await expect(page.locator(".book-card")).not.toHaveCount(0);
    await page.getByRole("button", { name: "Volver al match" }).click();
    await page.getByRole("button", { name: "Sorprendeme" }).click();
    for (let index = 0; index < 10; index++) {
      await page.locator(".answer-tile").first().click();
      await page
        .getByRole("button", {
          name: index === 9 ? "Ver mis resultados" : "Continuar",
          exact: true,
        })
        .click();
    }
    await expect(page.locator(".book-card")).toHaveCount(5);
  });

test("Nueva versión PWA espera sin borrar la partida y actualiza tras acción explícita", async ({
  page,
}) => {
  const root = resolve("dist");
  let upgraded = false;
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url!, "http://localhost").pathname;
      const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
      if (!file.startsWith(root + sep)) throw new Error("Fuera del build");
      let bytes = await readFile(file);
      if (path === "/sw.js" && upgraded)
        bytes = Buffer.from(
          bytes
            .toString()
            .replace(
              /const REVISION = "[^"]+";/,
              'const REVISION = "update-test";',
            ),
        );
      const types: Record<string, string> = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".webp": "image/webp",
      };
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address() as { port: number };
  try {
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await expect
      .poll(() =>
        page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      )
      .toBe(true);
    await page.getByRole("button", { name: "Sorprendeme" }).click();
    await page.locator(".answer-tile").nth(1).click();
    const question = await page.locator(".quiz h1").innerText();
    const answer = await page.locator("input:checked").getAttribute("value");
    upgraded = true;
    await page.evaluate(async () =>
      (await navigator.serviceWorker.ready).update(),
    );
    await expect
      .poll(() =>
        page.evaluate(async () =>
          Boolean((await navigator.serviceWorker.ready).waiting),
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("button", { name: "Actualizar y volver al inicio" }),
    ).toHaveCount(0);
    await expect(page.locator(".quiz h1")).toHaveText(question);
    await expect(page.locator("input:checked")).toHaveValue(answer!);
    for (let index = 0; index < 10; index++) {
      if (index) await page.locator(".answer-tile").first().click();
      await page
        .getByRole("button", {
          name: index === 9 ? "Ver mis resultados" : "Continuar",
          exact: true,
        })
        .click();
    }
    await page
      .getByRole("button", { name: "Actualizar y volver al inicio" })
      .click();
    await expect(
      page.getByRole("heading", { name: /Tu próxima lectura/ }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).filter((key) =>
            key.startsWith("match-noveduc-"),
          ),
        ),
      )
      .toEqual(["match-noveduc-%2F-update-test"]);
  } finally {
    await page.goto("about:blank");
    await new Promise<void>((done) => {
      server.close(() => done());
      server.closeAllConnections();
    });
  }
});
