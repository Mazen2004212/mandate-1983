import type { ReactNode } from "react";

type MetadataRowProps = Readonly<{
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}>;

export function MetadataRow({ label, value, detail }: MetadataRowProps) {
  return (
    <div className="metadata-row">
      <dt className="metadata-row__label">{label}</dt>
      <dd className="metadata-row__value">
        <span>{value}</span>
        {detail ? <small>{detail}</small> : null}
      </dd>
    </div>
  );
}
