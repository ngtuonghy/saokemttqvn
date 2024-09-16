"use server";

import { prisma } from "@/libs/prisma";
import { format, isDate } from "date-fns";

const formatDate = (date) => {
	if (!isDate(date)) {
		return undefined;
	}
	const fmt = format(new Date(date), "yyyy-MM-dd");
	return new Date(fmt);
};

const getStatement = async (offSet = 1, search = "", date, banksName = "") => {
	prisma.$connect();
	const p = 20;

	const conditions = [];

	if (search.trim()) {
		conditions.push(
			{
				doc_no: {
					contains: search,
				},
			},
			{
				name_bank: {
					contains: search,
				},
			},
			{
				description: {
					contains: search,
				},
			},
		);
	}
	if (isNaN(parseInt(search)) === false) {
		conditions.push({
			credit: {
				equals: parseInt(search),
			},
			balance: {
				equals: parseInt(search),
			},
		});
	}

	let dateFilter = {};
	if (date) {
		const startDate = formatDate(date[0]);
		const endDate = formatDate(date[1]);
		if (startDate && endDate) {
			dateFilter = {
				gte: startDate,
				lte: endDate,
			};
		} else if (startDate) {
			dateFilter = {
				equals: startDate,
			};
		}
	}
	const data = await prisma.statement.findMany({
		skip: (offSet - 1) * p,
		take: p,
		where: {
			OR: conditions.length > 0 ? conditions : undefined,
			date: Object.entries(dateFilter).length === 0 ? undefined : dateFilter,
			...(banksName.length > 0 && {
				name_bank: {
					in: banksName,
				},
			}),
		},
	});
	prisma.$disconnect();
	return JSON.parse(JSON.stringify(data));
};
export { getStatement };
