import { PrismaClient } from "@prisma/client";
import { loadAllCsvFiles, transactionSeeder } from "../transaction-seeder.js";
import path from "path";
import { fileURLToPath } from "url";

export async function agribank(movingFile = true, deleteAll = false) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const prisma = new PrismaClient();
	prisma.$connect();

	const nameBank = "agribank";
	if (deleteAll) {
		await prisma.statement.deleteMany({
			where: {
				bank_name: nameBank,
			},
		});
	}
	// transactionSeeder("./files/bidv_1261122666_09-01_to_09-12-2024.csv", prisma);
	loadAllCsvFiles(`${__dirname}/files/`, nameBank, prisma, movingFile);
	await prisma.$disconnect();
}
