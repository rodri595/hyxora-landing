/**
 * Scaffold body for the Cerebro tabs that aren't built yet. Lists the hooks
 * already wired for that tab so there's no need to re-read admin.md when
 * filling one in.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description What this tab should end up showing.
 * @param {string[]} [props.hooks] Hook names from `hooks/cerebro/` that feed it.
 */
const Placeholder = ({ title, description, hooks = [] }) => (
  <div className="flex flex-col gap-2.5 py-8">
    <p className="font-inter text-[13px] font-medium text-[#19363F] tracking-[-0.5px]">{title}</p>

    <p className="font-inter text-[11px] leading-[1.6] text-[rgba(25,54,63,0.5)] tracking-[-0.44px] max-w-[560px]">
      {description}
    </p>

    {hooks.length > 0 && (
      <div className="flex flex-col gap-2 mt-3">
        <span className="font-inter text-[9px] font-medium uppercase tracking-[0.6px] text-[rgba(25,54,63,0.35)]">
          Hooks disponibles
        </span>
        <div className="flex flex-wrap gap-1.5 max-w-[560px]">
          {hooks.map((hook) => (
            <code
              key={hook}
              className="font-mono text-[10px] tracking-tight text-[rgba(25,54,63,0.65)] bg-[rgba(25,54,63,0.04)] border-[0.7px] border-[rgba(25,54,63,0.08)] rounded-[5px] px-1.5 py-0.5"
            >
              {hook}
            </code>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Placeholder;
