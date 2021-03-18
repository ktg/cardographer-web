import type {Request, Response} from "express";

export async function get(req: Request, res: Response) {
	//const result = await getMongoCollection(req, 'wetland-critters').find().toArray()
	res.json([
		{name: "Coot", image: "/images/21481.jpg"},
		{name: "Moorhen", image: "/images/386827.jpg"},
		{name: "Great Crested Grebe", image: "/images/242170941.jpg"}
	]);
}