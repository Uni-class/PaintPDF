import ghPages from "gh-pages";

const publisher = await ghPages.publish(
	"src",
	{
		branch: "dist",
		tag: Date.now(),
	},
	(error) => {
		if (error) {
			console.error("Build Deploy Failed");
			console.error(error);
			return;
		}
		console.log("Build Deploy Completed");
	},
);
