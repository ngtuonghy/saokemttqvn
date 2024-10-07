import { pdf } from "@fdocs/pdf";
import { vietinbankParser } from "../vietinbank";
import fs from "fs";
import path from "path";

// const extractor = async () => {
// 	const dirPath = new URL(".", import.meta.url).pathname; // Lấy đường dẫn đến thư mục hiện tại
// 	const files = fs.readdirSync(dirPath);
//
// 	for (const file of files) {
// 		const filePath = path.join(dirPath, file); // Tạo đường dẫn đầy đủ cho mỗi file
// 		const fileExtension = path.extname(file).toLowerCase(); // Lấy phần mở rộng của file
// 		if (fileExtension === ".pdf") {
// 			const content = await pdf(filePath, {
// 				pages: "1-3",
// 			});
// 			const lines = content.getText().join("\n").trim().split("\n");
// 			fs.writeFileSync(
// 				`${path.basename(file, fileExtension)}.txt`,
// 				lines.join("\n"),
// 			);
//
// console.log(content)
// 		}
// 	}
// };
//

const filePath = path.join(
	__dirname,
	"./vietinbank_111602391111_09-24_to_09-29-2024.pdf",
);
const extractor = async () => {
	const vietinbank = await vietinbankParser(filePath, {
		pages: "all",
		format: "CSV",
		outputFile: `${path.basename(filePath, path.extname(filePath))}.csv`,
	});
	// const vieti = await vietinbankParser(filePath, {
	// 	pages: "1-2",
	// 	format: "JSON",
	// 	outputFile: `${path.basename(filePath, path.extname(filePath))}.json`,
	// });
};
extractor();
