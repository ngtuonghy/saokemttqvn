import path from "path";
import { agribank } from "../agribank";

const filePath = path.join(
	__dirname,
	"./agribank_1500201113838_09-09_to_09-12-2024.pdf",
);
const extractor = async () => {
	const bank = await agribank(filePath, {
		pages: "all",
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
