import { bidv } from "./bidv/bidv.js";
import { vietinbank } from "./vietinbank/vietinbank.js";
import { vietcombank } from "./vietcombank/vietcombank.js";
import pLimit from "p-limit";

const limit = pLimit(1);

(async () => {
	try {
		const tasks = [() => vietinbank(), () => vietcombank(), () => bidv()];
		const limitedTasks = tasks.map((task) => limit(task));
		await Promise.all(limitedTasks);
		console.log("All tasks have been executed");
	} catch (error) {
		console.error("Error executing tasks:", error);
	}
})();
