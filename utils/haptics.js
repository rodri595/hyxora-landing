"use client";

import { WebHaptics } from "web-haptics";

/**
 * Shared haptic feedback helper.
 *
 * Backed by a single WebHaptics instance (singleton) so we never spin up more
 * than one hidden DOM node / AudioContext, no matter how many components call
 * it. Safe to import anywhere — it no-ops during SSR.
 *
 * `debug` enables the desktop audio simulation (the "click" you hear when there
 * is no vibration motor). We only want that while developing; on real phones in
 * production we use the actual vibration motor with no audio.
 *
 * Available presets:
 *   success | warning | error | light | medium | heavy | soft | rigid |
 *   selection | nudge | buzz
 *
 * @see https://haptics.lochie.me
 */
let instance;

const getHaptics = () => {
  if (typeof window === "undefined") return null;
  if (!instance) instance = new WebHaptics({ debug: true });
  return instance;
};

/**
 * Trigger haptic feedback.
 *
 * @param {string|number|number[]|object} [pattern="selection"] - A preset name
 *   (see list above), a duration in ms, a pattern array, or a custom config.
 * @param {{ intensity?: number }} [options] - Default intensity for the pattern.
 */
export const haptic = (pattern, options) =>
  getHaptics()?.trigger(pattern ?? "selection", options);

/** Stop any in-progress vibration. */
export const cancelHaptic = () => getHaptics()?.cancel();

export default haptic;
