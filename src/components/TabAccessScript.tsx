import { tabAccessScript } from "@/lib/gate/tab-access";

type Props = Readonly<{ nonce?: string; gated: boolean }>;

export function TabAccessScript({ nonce, gated }: Props): React.ReactElement {
  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: tabAccessScript(gated) }}
    />
  );
}
