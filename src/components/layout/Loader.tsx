import { SITE } from "@/lib/constants";
import { LoaderDismiss } from "./LoaderDismiss";

/**
 * Server-rendered fade-in mask that covers the page until React hydrates.
 * The accompanying client `LoaderDismiss` triggers the fade-out on mount.
 * Markup is static so the browser paints it on first HTML chunk.
 */
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
