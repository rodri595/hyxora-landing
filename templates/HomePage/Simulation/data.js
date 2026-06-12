export const INITIAL = 10000;
export const MONTHLY = 1000;
export const APY = 0.5;
export const MAX_YEARS = 50;

export const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// The chart never renders fewer than this many columns.
export const MIN_BARS = 10;

// One row per chart column / table row. 1 year → 12 monthly points. Short
// horizons subdivide each year (bimonthly/quarterly/semesters) so the chart
// keeps at least MIN_BARS columns; from MIN_BARS years up, every year gets
// its own bar so longer periods read as more growth.
export const buildSimulationRows = ({
  initial,
  contribution,
  frequency,
  years,
}) => {
  const perYear = frequency === "monthly" ? contribution * 12 : contribution;
  // Transparent spacer between the stacked bars, scaled to the final total.
  const gap = Math.max(Math.round((initial + perYear * years) * 0.02), 50);

  let points;
  if (years === 1) {
    points = MONTHS.map((month, i) => ({ label: month, t: (i + 1) / 12 }));
  } else {
    const totalMonths = years * 12;
    // Coarsest step (in months) that still yields at least MIN_BARS columns.
    const step = [12, 6, 4, 3, 2].find((s) => totalMonths / s >= MIN_BARS) ?? 2;
    points = Array.from({ length: totalMonths / step }, (_, i) => {
      const m = (i + 1) * step;
      return {
        label: m % 12 === 0 ? `A${m / 12}` : `${m}m`,
        t: m / 12,
      };
    });
  }

  return points.map(({ label, t }) => ({
    month: label,
    initial,
    gap,
    contributions: Math.round(perYear * t),
  }));
};

export const simulationData = buildSimulationRows({
  initial: INITIAL,
  contribution: MONTHLY,
  frequency: "monthly",
  years: 1,
});
