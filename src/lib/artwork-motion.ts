/** Project a crank revolving in the roller's end plane, viewed obliquely.
 * The grip translates with the arm but remains parallel to the roller shaft.
 * Coordinates match the existing 1774 × 887 press illustration. */
export function crankPose(angle: number, width: number, height: number) {
  const hub = { x: width * .794, y: height * .275 };
  const radius = height * .22;
  const elbow = {
    x: hub.x + Math.sin(angle) * radius * .32,
    y: hub.y + Math.cos(angle) * radius,
  };
  const grip = { x: elbow.x + width * .04, y: elbow.y + height * .008 };
  // The leftward half of the projected orbit is nearest the viewer.
  // This depth controls occlusion independently of the arm's screen position.
  const depth = -Math.sin(angle);
  return { hub, elbow, grip, depth };
}

/** A sphere's dots revolve in 3D, then project onto its circular silhouette. */
export function spherePoint(latitude: number, longitude: number, turn: number) {
  const ring = Math.cos(latitude);
  const angle = longitude + turn;
  return { x: ring * Math.sin(angle), y: Math.sin(latitude), z: ring * Math.cos(angle) };
}
