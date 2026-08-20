import { describe, expect, it } from "vitest";
import { BOX_INTERVAL_DAYS, formatWhen, nextSchedule, pickLatestWrong } from "./scheduling";

const DAY = 86_400_000;
const NOW = new Date("2026-01-01T12:00:00Z").getTime();

describe("nextSchedule", () => {
  it("promotes a remembered card and pushes it further out", () => {
    expect(nextSchedule(1, true, NOW).box).toBe(2);
    expect(nextSchedule(2, true, NOW).box).toBe(3);
    expect(nextSchedule(4, true, NOW).box).toBe(5);
  });

  it("caps promotion at box 5", () => {
    expect(nextSchedule(5, true, NOW).box).toBe(5);
    expect(nextSchedule(99, true, NOW).box).toBe(5);
  });

  it("drops a missed card to box 1 regardless of how high it was", () => {
    for (const box of [1, 2, 3, 4, 5]) {
      expect(nextSchedule(box, false, NOW).box).toBe(1);
    }
  });

  it("brings a missed card back tomorrow, not immediately", () => {
    const { dueAt } = nextSchedule(4, false, NOW);
    expect(dueAt.getTime()).toBe(NOW + 1 * DAY);
    expect(dueAt.getTime()).toBeGreaterThan(NOW);
  });

  it("uses the documented interval for each box", () => {
    for (const box of [1, 2, 3, 4]) {
      const { dueAt } = nextSchedule(box, true, NOW);
      expect(dueAt.getTime()).toBe(NOW + BOX_INTERVAL_DAYS[box + 1] * DAY);
    }
  });

  it("treats an unseen card as box 1", () => {
    expect(nextSchedule(undefined, true, NOW).box).toBe(2);
    expect(nextSchedule(undefined, false, NOW).box).toBe(1);
  });

  it("makes intervals strictly increasing so review load falls over time", () => {
    const intervals = BOX_INTERVAL_DAYS.slice(1);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });
});

describe("pickLatestWrong", () => {
  const wrong = (id: string) => ({ questionId: id, wasCorrect: false });
  const right = (id: string) => ({ questionId: id, wasCorrect: true });

  it("collects questions answered incorrectly", () => {
    const out = pickLatestWrong([{ answers: [wrong("q1"), right("q2"), wrong("q3")] }]);
    expect([...out].sort()).toEqual(["q1", "q3"]);
  });

  // Regression: the drill must shrink as you improve, not accumulate.
  it("drops a question once a newer attempt gets it right", () => {
    const out = pickLatestWrong([
      { answers: [right("q1")] }, // newest
      { answers: [wrong("q1")] }, // older
    ]);
    expect(out.has("q1")).toBe(false);
  });

  it("re-adds a question if the newest attempt gets it wrong again", () => {
    const out = pickLatestWrong([
      { answers: [wrong("q1")] }, // newest
      { answers: [right("q1")] },
      { answers: [wrong("q1")] },
    ]);
    expect(out.has("q1")).toBe(true);
  });

  it("ignores older outcomes entirely", () => {
    const out = pickLatestWrong([
      { answers: [right("q1"), right("q2")] },
      { answers: [wrong("q1"), wrong("q2"), wrong("q3")] },
    ]);
    expect([...out]).toEqual(["q3"]);
  });

  it("returns nothing for an empty history", () => {
    expect(pickLatestWrong([]).size).toBe(0);
  });
});

describe("formatWhen", () => {
  it("describes the wait in human terms", () => {
    expect(formatWhen(new Date(NOW - 1000), NOW)).toBe("now");
    expect(formatWhen(new Date(NOW + 30 * 60_000), NOW)).toBe("in under an hour");
    expect(formatWhen(new Date(NOW + 5 * 3_600_000), NOW)).toBe("in 5 hours");
    expect(formatWhen(new Date(NOW + 1 * DAY), NOW)).toBe("tomorrow");
    expect(formatWhen(new Date(NOW + 3 * DAY), NOW)).toBe("in 3 days");
  });
});
