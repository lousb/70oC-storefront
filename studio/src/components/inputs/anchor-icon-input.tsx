import { Box, Card, Flex } from "@sanity/ui";
import { useFormValue, type StringInputProps } from "sanity";

/**
 * Icon dropdown on each Home section, with a live preview of the chosen
 * icon beside it. Previews are 160px copies of the storefront's
 * public/icons/02Icons PNGs, served from studio/static/anchor-icons.
 * Falls back to the section's own icon (sectionName) when blank, same as
 * the storefront does.
 */
export function AnchorIconInput(props: StringInputProps) {
  const fallback = useFormValue([...props.path.slice(0, -1), "sectionName"]) as
    | string
    | undefined;
  const value = props.value || fallback;
  const slug = value?.toLowerCase();

  return (
    <Flex gap={3} align="center">
      <Card
        radius={2}
        border
        padding={2}
        style={{ width: 64, height: 64, flex: "none", background: "#fff" }}
      >
        {slug && (
          <img
            src={`/static/anchor-icons/${slug}.png`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        )}
      </Card>
      <Box flex={1}>{props.renderDefault(props)}</Box>
    </Flex>
  );
}
