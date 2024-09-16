const isDate = function (date) {
	return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};
export { isDate };
