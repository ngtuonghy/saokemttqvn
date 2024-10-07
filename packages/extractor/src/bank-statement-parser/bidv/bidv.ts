import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../utils/generate-CSV";
import { writeFileSync } from "fs";

type VietinbankParserOptions = {
	pages?: string | "all" | number[];
	outputFile?: string;
	format?: "CSV" | "JSON";
	headers?: string[];
	password?: string;
};
function isNumber(str: any) {
	const normalizedStr = str.replace(/\./g, "").replace(",", ".");
	return !isNaN(parseFloat(normalizedStr)) && isFinite(normalizedStr);
}
function isValidCurrency(str: string) {
	const regex = /^\d{1,3}(\.\d{3})*(,\d{2})?$|^\d{1,3}(\.\d{3})*$/;
	return regex.test(str);
}
const bidvParser = async (
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
		password: config.password,
		sort: "Y1",
		pages: pages,
		skip: {
			ranges: [
				{
					start: {
						value: "STT",
						match: "exact",
					},
					end: {
						value: "Số tiền ghi nợ (VND)",
						match: "exact",
					},
				},
			],
			text: [
				{
					value:
						"Chứng từ này được in/chuyển đổi trực tiếp từ hệ thống In sao kê tài khoản khách",
					match: "contain",
				},
				{
					value: "351",
					match: "exact",
					nextLine: {
						value:
							"Chứng từ này được in/chuyển đổi trực tiếp từ hệ thống In sao kê tài khoản khách",
						match: "contain",
					},
				},
			],
		},
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	writeFileSync("bidv.txt", lines.join("\n"));
	let currentTransaction = null;
	// console.log("100.000,001200979797 .".match(/^(.*?),(.*)$/));
	lines.forEach((line, index) => {
		const match = line.match(/^(\d{2}\/\d{2}\/\d{4}) (.*)/);
		// const lineReplace = line.replace(/,/g, ";");

		const prevX2 = index > 1 ? lines[index - 2] : null;
		const prevLine = index > 0 ? lines[index - 1] : null;
		if (match) {
			if (currentTransaction) {
				transactions.push(currentTransaction);
			}
			// console.log("match", match);
			const t = line.match(/^(\d{2}\/\d{2}\/\d{4} \d{1,2}:\d{2}:\d{2})(.*)/);

			currentTransaction = {
				[headers[0]]: prevLine, // "no"
				[headers[1]]: t ? t[1] : line, // "dateTime"
				[headers[2]]: "", // "credit"
				[headers[3]]: "", // "transactionComment"
				[headers[4]]: t ? t[2] : "", // "offsetName"
			};
		} else if (currentTransaction && !currentTransaction[headers[0]]) {
			currentTransaction[headers[0]] = line;
		} else if (currentTransaction && !currentTransaction[headers[1]]) {
			currentTransaction[headers[1]] = line;
		} else if (
			currentTransaction &&
			!currentTransaction[headers[4]] &&
			!isValidCurrency(line) &&
			line.match(/^\d+xxx$/)
		) {
			currentTransaction[headers[4]] = line;
		} else if (
			currentTransaction &&
			!currentTransaction[headers[2]] &&
			isValidCurrency(line)
		) {
			// console.log("line", line);

			const ls = line.split(",");
			if (line === "0" || ls[0] === "0") {
				return;
			}

			currentTransaction[headers[2]] = ls ? ls[0] : line;
			console.log("line", line, ls, line !== "0", ls[0] !== "0");
		} else {
			if (currentTransaction && !isNumber(line)) {
				const regex = /(\d{1,3}(?:\.\d{3})*,\d{2})(.*?\s.*)/;
				if (line.match(regex)) {
					const match = line.match(regex);
					if (isValidCurrency(match[1])) {
						currentTransaction[headers[2]] = match[1].split(",")[0];
					}
					if (!currentTransaction[headers[3]])
						currentTransaction[headers[3]] += match[2].replace(/,/g, ";");
				} else {
					if (!currentTransaction[headers[3]])
						currentTransaction[headers[3]] += line.replace(/,/g, ";");
				}
			}
		}
	});

	if (currentTransaction) {
		transactions.push(currentTransaction);
	}

	if (config.format === "CSV") {
		const csv = generateCSV(transactions, headers);
		if (config.outputFile) {
			writeFileSync(config.outputFile, csv);
		}
		return csv;
	} else {
		if (config.outputFile) {
			writeFileSync(config.outputFile, JSON.stringify(transactions, null, 2));
		}
		return transactions;
	}
};

export { bidvParser };
