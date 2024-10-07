import fs from "fs";
import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../../utils/generate-CSV";

const isCurrency = (str: string): boolean => {
	const currencyRegex = /^[-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?$/;

	// Loại bỏ khoảng trắng và kiểm tra
	const cleanStr = str.trim();

	return currencyRegex.test(cleanStr);
};

type VietinbankParserOptions = {
	pages?: string | "all" | number[];
	password?: string;
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
};
const vietinbankParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "1",
		format: "JSON",
	},
) => {
	const headers = config.headers || [
		"no",
		"dateTime",
		"credit",
		"transactionComment",
		"offsetName",
	];

	const pages = config.pages || "1";
	const content = await pdf(file, {
		sort: "none",
		pages: pages,
		password: config.password,
		skipLines: {
			pages: [
				{
					page: 1,
					lastLines: 7,
				},
			],
		},
		skipLinesByText: [
			{
				type: "startWith",
				text: "Từ ngày",
			},
			{
				type: "startWith",
				text: "From date",
			},
		],
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	fs.writeFileSync("vietinbank.txt", lines.join("\n"));
	// const regex = /^(\d+)(\d{2}\/\d{2}\/.+)$/;
	let currentTransaction = null;
	lines.forEach((line, index) => {
		const lineReplace = line.replace(",", ";");
		const linePrev = index > 0 ? lines[index - 1] : null;
		const match = lineReplace.match(/^(\d{2}\/\d{2}\/\d{4}) (.+)/);
		const match2 = lineReplace.match(/^([\d.,]+)(.*)$/);
		if (match) {
			if (currentTransaction) {
				transactions.push(currentTransaction);
			}
			currentTransaction = {
				[headers[0]]: linePrev, // "no"
				[headers[1]]: match[0], // "dateTime"
				[headers[2]]: "", // "credit"
				[headers[3]]: "", // "transactionComment
				[headers[4]]: "", // "offsetName"
			};
		} else if (currentTransaction) {
			if (!currentTransaction[headers[3]]) {
				currentTransaction[headers[3]] = lineReplace;
			} else if (!currentTransaction[headers[0]]) {
				currentTransaction[headers[0]] = lineReplace;
			} else if (!currentTransaction[headers[2]]) {
				// console.log(match2);
				if (match2) {
					currentTransaction[headers[2]] = match2[1];
					currentTransaction[headers[4]] = match2[2];
				} else {
					currentTransaction[headers[2]] = lineReplace;
				}
			} else if (isNaN(Number(lineReplace))) {
				currentTransaction[headers[4]] =
					(currentTransaction[headers[4]] || "") +
					(currentTransaction[headers[4]] ? " " : "") +
					lineReplace;
			}
		}
	});

	if (currentTransaction) {
		transactions.push(currentTransaction);
	}

	if (config.format === "CSV") {
		const csv = generateCSV(transactions, [
			"no",
			"dateTime",
			"credit",
			"transactionComment",
			"offsetName",
		]);
		if (config.outputFile) {
			fs.writeFileSync(config.outputFile, csv);
		}
		return csv;
	} else {
		if (config.outputFile) {
			fs.writeFileSync(
				config.outputFile,
				JSON.stringify(transactions, null, 2),
			);
		}
		return transactions;
	}
};

export { vietinbankParser };
