import fs from "fs";
import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../../utils/generate-CSV";

type VietinbankParserOptions = {
	pages?: string | "all";
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
	password?: string;
};

function isNumber(str) {
	// Thay dấu chấm ngăn cách phần ngàn thành chuỗi rỗng và dấu phẩy thành dấu chấm
	const normalizedStr = str.replace(/\./g, "").replace(",", ".");

	// Kiểm tra nếu giá trị đã chuyển đổi là một số hợp lệ
	return !isNaN(parseFloat(normalizedStr)) && isFinite(normalizedStr);
}
function isValidCurrency(str: string) {
	const regex = /^\d{1,3}(\.\d{3})*(,\d{2})?$|^\d{1,3}(\.\d{3})*$/;
	return regex.test(str);
}

const vietcombankParser = async (
	file: string,
	config: VietinbankParserOptions = {
		pages: "all",
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
		skipLinesByText: [
			{
				type: "contain",
				text: "Ghi chú: Quý khách sử dụng văn bản này đúng mục đích",
			},
			{
				type: "exact",
				text: "ữ liệu cá nhân ./.",
			},
		],
		skipLines: {
			pages: [
				{
					page: 1,
					lines: "1-16",
				},
			],
			// allPages: {
			// 	lines: "1-11",
			// },

			ranges: [
				{
					start: {
						text: "Telex",
						type: "exact",
					},
					end: {
						text: /^Page \d+ of \d+$/,
						type: "regex",
					},
				},
				{
					start: {
						text: "Ngày giờ giao dịch",
						type: "exact",
					},
					end: {
						text: "STT ",
						type: "exact",
					},
				},
			],
		},
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	fs.writeFileSync("vietcombank.txt", lines.join("\n"));
	let currentTransaction = null;

	lines.forEach((line, index) => {
		const prevLine = lines[index - 1];
		const lineReplace = line;
		const style1 = lineReplace.match(/^(\d{2}\/\d{2}\/\d{4}) (.+)/);
		const style2 = lineReplace.match(/^(\d{2}\/\d{2}\/\d{4})/);

		if (style2) {
			if (currentTransaction) {
				transactions.push(currentTransaction);
			}
			currentTransaction = {
				[headers[0]]: "", // "no"
				[headers[1]]: line, // "dateTime"
				[headers[2]]: "", // "credit"
				[headers[3]]: "", // "transactionComment
				[headers[4]]: "",
			};
		} else if (
			currentTransaction &&
			!currentTransaction[headers[0]] &&
			isNumber(line) &&
			currentTransaction[headers[2]]
		) {
			currentTransaction[headers[0]] = line;
		} else if (
			currentTransaction &&
			currentTransaction[headers[1]] &&
			line.match(/^\d{1,2}:\d{2}:\d{2}/)
		) {
			currentTransaction[headers[1]] += " " + line;
		} else if (currentTransaction && !currentTransaction[headers[2]]) {
			const ls = line.split(",");
			currentTransaction[headers[2]] = ls ? ls[0] : line;
		} else if (currentTransaction && !currentTransaction[headers[4]]) {
			currentTransaction[headers[4]] = line;
		} else {
			if (currentTransaction) {
				if (line === "hang") {
					currentTransaction[headers[4]] += " " + line;
					return;
				}
				currentTransaction[headers[3]] += " " + line.replace(/,/g, "");
			}
		}
	});
	if (currentTransaction) {
		transactions.push(currentTransaction);
	}

	if (config.format === "CSV") {
		const csv = generateCSV(transactions, headers);
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
export { vietcombankParser };
