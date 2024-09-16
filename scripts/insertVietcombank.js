import fs from "fs";
import PdfParse from "pdf-parse-new";
import { PrismaClient } from "@prisma/client";

function formatToISO(dateString) {
	const [day, month, year] = dateString.split("/");
	const date = new Date(`${year}-${month}-${day}`);
	return date.toISOString();
}

const textTo = (lines) => {
	const transactions = [];
	let currentTransaction = null;
	const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

	let numberPage;
	lines.forEach((line, index) => {
		const trimmedLine = line.trim();
		if (trimmedLine.includes("--page-break-")) {
			numberPage = trimmedLine.match(/--page-break-(\d+)/)[1];
		} else {
			if (dateRegex.test(trimmedLine)) {
				if (currentTransaction) {
					transactions.push(currentTransaction);
				}
				currentTransaction = {
					date: formatToISO(trimmedLine),
					docNo: null,
					credit: null,
					balance: null,
					nameBank: "vietcombank",
					description: "",
					pageNumber: parseInt(numberPage),
				};
			} else if (currentTransaction && !currentTransaction.docNo) {
				currentTransaction.docNo = trimmedLine;
			} else if (
				/^\d+(\.\d+)?\s*$/.test(trimmedLine) &&
				currentTransaction &&
				!currentTransaction.credit
			) {
				currentTransaction.credit = trimmedLine;
			} else if (currentTransaction) {
				if (!currentTransaction.credit) {
					currentTransaction.credit = trimmedLine.split(" ")[0];
					currentTransaction.description = trimmedLine
						.split(" ")
						.slice(1)
						.join(" ");
				} else {
					currentTransaction.description += trimmedLine + " ";
				}
			}
		}

		if (index === lines.length - 1 && currentTransaction) {
			transactions.push(currentTransaction);
		}
	});

	return transactions;
};

const clearText = (text) => {
	const lines = text.split("\n");
	const result = [];
	let isRemove = true;

	for (const line of lines) {
		if (line.includes("Transactions in detail")) {
			isRemove = false;
			continue;
		}
		if (/Page \d+ of \d+/.test(line)) {
			isRemove = true;
		}
		if (line.includes("--page-break-")) {
			isRemove = true;
			result.push(line);
		}
		if (!isRemove && line.trim() !== "") {
			result.push(line);
		}
	}
	return result;
};

async function main() {
	const pdfPath = `./vietcombank.pdf`;
	const pdfBuffer = fs.readFileSync(pdfPath);
	const data = await PdfParse(pdfBuffer);
	let result = "";
	data.text.split("\n\n").forEach((line, i) => {
		result += `--page-break-${i}\n${line}\n`;
	});
	const raw = clearText(result);
	const obj = textTo(raw);
	// console.log(obj);
	const prisma = new PrismaClient();
	await prisma.statement.deleteMany({
		where: {
			name_bank: "vietcombank",
		},
	});
	const transactions = obj.map((item) => {
		const credit = item.credit || "";
		const balance = item.balance || "";
		const formatCredit = credit.replaceAll(".", "");
		const formatBalance = balance.replaceAll(".", "");
		return {
			date: item.date,
			doc_no: item.docNo,
			credit: parseFloat(formatCredit),
			balance: parseFloat(formatBalance),
			name_bank: item.nameBank,
			description: item.description,
			page_number: item.pageNumber,
		};
	});

	await prisma.statement.createMany({
		data: transactions,
	});
}

main().catch(console.error);
