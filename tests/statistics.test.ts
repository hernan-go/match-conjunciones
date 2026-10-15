import { afterEach, beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  const storage: Record<string, string> = {};
  Object.defineProperties(storage, {
    getItem: { value: (key: string) => storage[key] ?? null },
    setItem: {
      value: (key: string, value: string) => {
        storage[key] = value;
      },
    },
    removeItem: {
      value: (key: string) => {
        delete storage[key];
      },
    },
  });
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", new EventTarget());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("visita persistida, recarga y nuevo navegador; solo envía tipo e ID", async () => {
  const fetch = vi.fn(async (_url: string, _options?: RequestInit) =>
    Response.json({ visitors: 1, matchComplete: 0 }),
  );
  vi.stubGlobal("fetch", fetch);
  let stats = await import("../src/services/statistics");
  stats.registerVisitor();
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  await vi.waitFor(() =>
    expect(Object.keys(localStorage).some((k) => k.includes(":visited"))).toBe(
      true,
    ),
  );
  vi.resetModules();
  stats = await import("../src/services/statistics");
  stats.registerVisitor();
  await stats.flushStatistics();
  expect(fetch).toHaveBeenCalledTimes(1);
  const body = JSON.parse(fetch.mock.calls[0][1]!.body as string);
  expect(Object.keys(body).sort()).toEqual(["id", "type"]);
  for (const key of Object.keys(localStorage)) localStorage.removeItem(key);
  stats.registerVisitor();
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetch.mock.calls[1][1]!.body as string).id).not.toBe(
    body.id,
  );
});

test("respuesta perdida y recarga reenvían el mismo ID; nuevas partidas usan otro", async () => {
  const fetch = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetch);
  let stats = await import("../src/services/statistics");
  const id = stats.newMatchId();
  stats.registerComplete(id);
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(Object.keys(localStorage)).toHaveLength(1);
  vi.resetModules();
  stats = await import("../src/services/statistics");
  fetch.mockResolvedValue(Response.json({ visitors: 0, matchComplete: 1 }));
  await stats.flushStatistics();
  expect(JSON.parse(fetch.mock.calls[1][1].body).id).toBe(id);
  expect(Object.keys(localStorage)).toHaveLength(0);
  stats.registerComplete(stats.newMatchId());
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetch.mock.calls[2][1].body).id).not.toBe(id);
});

test("fallos limitan reintentos a cinco y no rechazan al llamador", async () => {
  const fetch = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetch);
  const stats = await import("../src/services/statistics");
  stats.registerComplete(stats.newMatchId());
  await vi.advanceTimersByTimeAsync(120000);
  expect(fetch).toHaveBeenCalledTimes(5);
  await stats.flushStatistics();
  expect(fetch).toHaveBeenCalledTimes(5);
});

test("una partida encolada durante el POST de visita se envía al liberarse la cola", async () => {
  let confirm!: (response: Response) => void;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          confirm = resolve;
        }),
    )
    .mockResolvedValue(Response.json({ visitors: 1, matchComplete: 1 }));
  vi.stubGlobal("fetch", fetch);
  const stats = await import("../src/services/statistics");
  stats.registerVisitor();
  stats.registerComplete(stats.newMatchId());
  expect(fetch).toHaveBeenCalledTimes(1);
  confirm(Response.json({ visitors: 1, matchComplete: 0 }));
  await vi.advanceTimersByTimeAsync(1);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetch.mock.calls[1][1].body).type).toBe("complete");
});

test("almacenamiento bloqueado y totales inválidos no rompen el juego", async () => {
  vi.stubGlobal("localStorage", {
    getItem() {
      throw new Error("blocked");
    },
  });
  const stats = await import("../src/services/statistics");
  expect(() => stats.registerVisitor()).not.toThrow();
  expect(stats.validTotals({ visitors: -1, matchComplete: 2 })).toBe(false);
  expect(stats.validTotals({ visitors: "12", matchComplete: 2 })).toBe(false);
  expect(stats.validTotals({ visitors: 12, matchComplete: 2 })).toBe(true);
});
