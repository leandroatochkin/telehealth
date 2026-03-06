import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function DateSelector({ value, onChange }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          onChange(newValue ? newValue.toDate() : null);
        }}
      />
    </LocalizationProvider>
  );
}
