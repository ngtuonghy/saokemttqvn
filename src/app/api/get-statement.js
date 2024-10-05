"use server";
import { prisma } from "@/libs/prisma";

const getStatement = async (offSet = 1, search = "", date, banksName = "") => {
	prisma.$connect();
	const p = 20;
	const conditions = [];

	if (search) {
		conditions.push(
			{
				no: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				transaction_description: {
					contains: search,
					mode: "insensitive",
				},
			},
			{
				reference_name: {
					contains: search,
					mode: "insensitive",
				},
			},
		);

		if (!isNaN(parseInt(search))) {
			conditions.push({
				OR: [
					{ credit_amount: { equals: parseInt(search) } },
					{ balance_amount: { equals: parseInt(search) } },
				],
			});
		}
	}

	let dateFilter = {};
	if (date) {
		const [startDate, endDate] = date;
		if (startDate && endDate) {
			dateFilter = { gte: startDate, lte: endDate };
		} else if (startDate) {
			dateFilter = { equals: startDate };
		}
	}

	let orderBy = [];
	if (search) {
		orderBy = [
			{
				credit_amount: "desc",
			},
			{
				transaction_description: "asc",
			},
		];
	} else {
		orderBy = [
			{
				transaction_date: "desc",
				// credit_amount: "asc",
			},
		];
	}

	const data = await prisma.statement.findMany({
		skip: (offSet - 1) * p,
		take: p,
		orderBy,
		where: {
			AND: [
				conditions.length > 0 ? { OR: conditions } : undefined,
				Object.keys(dateFilter).length > 0
					? { transaction_date: dateFilter }
					: undefined,
				banksName.length > 0 ? { bank_name: { in: banksName } } : undefined,
			].filter(Boolean),
		},
	});

	prisma.$disconnect();
	return JSON.parse(JSON.stringify(data));
};

// export default function handler(req, res) {
// 	res.status(200).json({ text: "Hello" });
// }

export { getStatement };
