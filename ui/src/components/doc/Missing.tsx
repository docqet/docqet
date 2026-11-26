import { PageHeader, View } from "../shell/layout";

/* What a doc page shows when its ID isn't in the projects showing. */
export function Missing({ kind, id }: { kind: string; id: string }) {
  return (
    <View title="Not found">
      <PageHeader
        title="Nothing by that name"
        lede={`No ${kind} called “${id}” is in the projects showing. It may have been renamed, or be in a project that isn't showing.`}
      />
    </View>
  );
}
