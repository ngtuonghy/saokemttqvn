import { PrismaClient } from "@prisma/client";
import { loadAllCsvFiles, transactionSeeder } from "../transaction-seeder.js";
import path from "path";
import { fileURLToPath } from "url";

async function vietcombank() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const prisma = new PrismaClient();
	prisma.$connect();
	const nameBank = "vietcombank";

	await prisma.statement.deleteMany({
		where: {
			bank_name: nameBank,
		},
	});

	// transactionSeeder(
	// 	"./files/vietcombank_0011001932418_09-15_to_09-23-2024.csv",
	// 	nameBank,
	// 	prisma,
	// );
	loadAllCsvFiles(`${__dirname}/files/`, nameBank, prisma);
	await prisma.$disconnect();
}
export { vietcombank };
