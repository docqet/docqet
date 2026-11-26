import { withParam } from "../routes";

/*
 * A choice kept in the address, as a row of links: what it is, then each
 * option, with how many it holds where that's known. The first option is the
 * default, which leaves the param out.
 */
export function Choice({
  label,
  param: key,
  value,
  options,
}: {
  label: string;
  param: string;
  value: string;
  options: ([string, string] | [string, string, number])[];
}) {
  return (
    <div className="lf-choice" role="group" aria-label={label}>
      <span className="lf-choice-label">{label}</span>
      {options.map(([v, name, n], i) => (
        <a key={v} href={withParam(key, i === 0 ? null : v)} aria-current={v === value ? "true" : undefined}>
          {name}
          {n !== undefined ? <span className="lf-choice-count">{n}</span> : null}
        </a>
      ))}
    </div>
  );
}
