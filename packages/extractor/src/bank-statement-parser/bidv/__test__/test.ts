import fs from "fs";
import path from "path";
import { bidvParser } from "../bidv";

const filePath = path.join(
	__dirname,
	"./bidv_1200979797_09-04_to_09-22-2024.pdf",
);
const extractor = async () => {
	const vietinbank = await bidvParser(filePath, {
		pages: "1-5",
		format: "CSV",
		outputFile: `${path.basename(filePath, path.extname(filePath))}.csv`,
	});
	// const vieti = await bidvParser(filePath, {
	// 	pages: "1-2",
	// 	format: "JSON",
	// 	outputFile: `${path.basename(filePath, path.extname(filePath))}.json`,
	// });
};
extractor();
