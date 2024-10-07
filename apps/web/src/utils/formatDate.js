import { format } from "date-fns";

function formatToISO(dateString) {
	const [day, month, year] = dateString.split("/");
	const date = new Date(`${year}-${month}-${day}`);
	return date.toISOString();
}

const formaToDate = (date, hr = false) => {
	if (hr) {
		return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
	}
	return format(new Date(date), "dd/MM/yyyy");
};

export { formatToISO, formaToDate };
