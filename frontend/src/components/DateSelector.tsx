import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAppSelector } from "../lib/hooks";
import 'dayjs/locale/es'; // Importa el locale español para dayjs

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function DateSelector({ value, onChange }: Props) {
  const { colors } = useAppSelector((state) => state.theme);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es"> {/* Configura el locale a español */}
      <DateCalendar
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          onChange(newValue ? newValue.toDate() : null);
        }}
        sx={{
          color: colors.textPrimary
        }}
      />
    </LocalizationProvider>
  );
}
