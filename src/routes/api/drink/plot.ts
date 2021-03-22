import type {Request, Response} from "express";
import simplify from "simplify-js";
import {getMongoCollection} from "../../../shared/db";

export async function get(req: Request, res: Response) {
	const result = await getMongoCollection(req, 'drink').find().sort({"device": 1, "time": 1}).toArray();

	let lines = []
	let dataAccel = []
	let dataAccelDrink = []
	let prev = {device: '', tag: null}

	result.push({x: 0, device: "end"})
	result.forEach((item) => {
		if ('x' in item) {
			if (item.device != prev.device) {
				createLine(lines, dataAccelDrink, prev.device + " Drinking", '#282')
				createLine(lines, dataAccel, prev.device, '#558')
				dataAccel = []
				dataAccelDrink = []
			}
			prev = item
			if (item.tag != prev.tag && dataAccel.length != 0) {
				dataAccel.push(convertItem(item))
				dataAccelDrink.push(convertItem(item))
			} else if (item.tag == 'drink') {
				dataAccelDrink.push(convertItem(item))
			} else {
				dataAccel.push(convertItem(item))
			}
		}
	})

	res.json(lines)
}

function convertItem(item) {
	return {x: item.time, y: item.x + item.y + item.z}
}

function createLine(lines, data, name: string, colour: string) {
	const lineSegments = []
	let currentSegment = []
	let prev = data[0].x
	data.forEach((item) => {
		if (Math.abs(prev - item.x) >= 1000) {
			lineSegments.push(simplify(currentSegment, 0.02, false))
			currentSegment = []
		}
		currentSegment.push(item)
		prev = item.x
	});

	let line = {
		x: [],
		y: [],
		mode: 'lines',
		name: name,
		line: {
			color: colour,
			width: 1
		}
	};
	lineSegments.forEach((segment) => {
		segment.forEach((point) => {
			line.x.push(new Date(point.x).toISOString());
			line.y.push(point.y);

		})
		line.x.push(null);
		line.y.push(null);
	});
	lines.push(line);
}