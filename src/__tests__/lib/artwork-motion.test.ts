import { describe, it, expect } from "vitest";
import { crankPose, spherePoint } from "@/lib/artwork-motion";

describe("projected crank mechanics", () => {
  it("passes in front of the roller on the near half and behind on the far half", () => {
    const rear = crankPose(Math.PI / 2, 1774, 887);
    const front = crankPose(Math.PI * 1.5, 1774, 887);
    expect(rear.depth).toBeCloseTo(-1);
    expect(front.depth).toBeCloseTo(1);
    expect(front.elbow.x).toBeLessThan(front.hub.x);
    expect(rear.elbow.x).toBeGreaterThan(rear.hub.x);
    expect(front.hub).toEqual(rear.hub);
  });
  it("holds the shaft fixed through a full turn while the grip keeps its orientation", () => {
    const initial = crankPose(0, 1774, 887);
    const radius = 887 * .22;
    for (const angle of [Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2]) {
      const pose = crankPose(angle, 1774, 887);
      expect(pose.hub).toEqual(initial.hub);
      expect(pose.grip.x - pose.elbow.x).toBeCloseTo(initial.grip.x - initial.elbow.x);
      expect(pose.grip.y - pose.elbow.y).toBeCloseTo(initial.grip.y - initial.elbow.y);
      const x = (pose.elbow.x - pose.hub.x) / (radius * .32);
      const y = (pose.elbow.y - pose.hub.y) / radius;
      expect(x * x + y * y).toBeCloseTo(1);
    }
    expect(crankPose(Math.PI * 2, 1774, 887).elbow.x).toBeCloseTo(initial.elbow.x);
    expect(crankPose(Math.PI * 2, 1774, 887).elbow.y).toBeCloseTo(initial.elbow.y);
  });
});

describe("rotating sphere particles", () => {
  it("preserves the spherical surface and moves dots from front to back", () => {
    const front = spherePoint(0, 0, 0);
    const side = spherePoint(0, 0, Math.PI / 2);
    const back = spherePoint(0, 0, Math.PI);
    expect(front.z).toBe(1);
    expect(side.x).toBeCloseTo(1);
    expect(back.z).toBeCloseTo(-1);
    for (const p of [front, side, back, spherePoint(.6, .8, 2)]) {
      expect(p.x * p.x + p.y * p.y + p.z * p.z).toBeCloseTo(1);
    }
  });
});
