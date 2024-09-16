function formatToISO(dateString) {
	const [day, month, year] = dateString.split("/");
	const date = new Date(`${year}-${month}-${day}`);
	return date.toISOString();
}
