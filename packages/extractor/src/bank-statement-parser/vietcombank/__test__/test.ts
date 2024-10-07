import fs from "fs";
import path from "path";
import { vietcombankParser } from "../vietcombank";

const filePath = path.join(
	__dirname,
	"./vietcombank_USD_0011371932538_09-11_to_09-30-2024.pdf",
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
