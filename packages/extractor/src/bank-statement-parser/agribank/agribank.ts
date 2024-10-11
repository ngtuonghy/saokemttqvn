import { pdf } from "@fdocs/pdf";
import { generateCSV } from "../../utils/generate-CSV";
import { writeFileSync } from "fs";

type BankParserOptions = {
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
	const regex = /^\d{1,3}([,.]\d{3})*([,.]\d{2})?$|^\d{1,3}([,.]\d{3})*$/;
	return regex.test(str);
}
const agribank = async (
	file: string,
	config: BankParserOptions = {
		pages: "all",
		format: "JSON",
	},
) => {
	const headers = config.headers || [
		"no",
		"dateTime",
		"credit",
		"balance",
		"transactionComment",
		"offsetName",
	];

	const pages = config.pages || "1";
	const content = await pdf(file, {
		password: config.password,
		sort: "none",
		pages: pages,
		skip: {
			global: {
				lastLines: 3,
				lines: "1-18",
			},
			pageSpecific: [
				{
					page: 1,
					lines: "1-76",
				},
			],
		},
	});
	const transactions = [];
	const lines = content.getText().join("\n").trim().split("\n");
	// writeFileSync("bank.txt", lines.join("\n"));

	let currentTransaction = null;

	lines.forEach((line, index) => {
		const match = line.match(/^(\d{2}\/\d{2}\/\d{4})/);

		if (match) {
			if (currentTransaction) {
				transactions.push(currentTransaction);
			}

			currentTransaction = {
				[headers[0]]: "", // "no"
				[headers[1]]: match[1], // "dateTime"
				[headers[2]]: "", // "credit"
				[headers[3]]: "", // "balance"
				[headers[4]]: "", // "transactionComment"
				[headers[5]]: "", // "offsetName"
			};
		} else if (
			currentTransaction &&
			!currentTransaction[headers[2]] &&
			isValidCurrency(line)
		) {
			currentTransaction[headers[2]] = line.replace(/,/g, "");
		} else if (
			currentTransaction &&
			!currentTransaction[headers[3]] &&
			isValidCurrency(line.split(",")[0])
		) {
			const lineSplit = line.split(" ");
			// console.log("lineSplit", lineSplit);
			currentTransaction[headers[3]] = lineSplit[0].replace(/,/g, "");
			currentTransaction[headers[0]] = lineSplit[1];
		} else {
			currentTransaction[headers[4]] =
				(currentTransaction[headers[4]] || "") +
				(currentTransaction[headers[4]] ? " " : "") +
				line.replace(/,/g, ";");
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

export { agribank };
