import { Box, Button, Typography } from "@mui/material";

type Slot = {
  start: string;
  end: string;
};

type Props = {
  slots: Slot[];
  onSelect: (slot: Slot) => void;
};

export default function SlotList({ slots, onSelect }: Props) {
  if (!slots?.length) {
    return <Typography>No slots available</Typography>;
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {slots.map((slot) => (
        <Button
          key={slot.start}
          variant="outlined"
          onClick={() => onSelect(slot)}
        >
          {new Date(slot.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Button>
      ))}
    </Box>
  );
}