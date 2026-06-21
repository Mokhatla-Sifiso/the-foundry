import { SITE } from "@/lib/constants";
import { LoaderDismiss } from "./LoaderDismiss";

export function Loader(): React.ReactElement {
  return (
    <div
      id="studio-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="studio-loader"
    >
      <span aria-hidden="true" className="studio-loader__mark">
        {SITE.shortName[0]}
      </span>
      <LoaderDismiss />
    </div>
  );
}
