import fs from "fs";
import path from "path";
import { vietcombankParser } from "../vietcombank";

const filePath = path.join(
	__dirname,
	"./vietcombank_0011001932418_10-01_to_10-07-2024.pdf",
);
const extractor = async () => {
	const vietinbank = await vietcombankParser(filePath, {
		pages: "all",
		format: "CSV",
		outputFile: `${path.basename(filePath, path.extname(filePath))}.csv`,
	});
	// const vieti = await vietcombankParser(filePath, {
	// 	pages: "1-2",
	// 	format: "JSON",
	// 	outputFile: `${path.basename(filePath, path.extname(filePath))}.json`,
	// });
};
extractor();
