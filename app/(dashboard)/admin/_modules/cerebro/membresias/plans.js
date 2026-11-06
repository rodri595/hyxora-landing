import { cerebroPlans } from "@/constants/cerebro";

/**
 * Canonical plan order first, then any plan the API sent that `cerebroPlans`
 * doesn't know — appended rather than dropped, so a new tier still shows up.
 *
 * @param {string[]} plans
 * @return {string[]}
 */
export const orderPlans = (plans) => {
  const seen = new Set(plans);
  return [
    ...cerebroPlans.filter((plan) => seen.has(plan)),
    ...[...seen].filter((plan) => !cerebroPlans.includes(plan)),
  ];
};
