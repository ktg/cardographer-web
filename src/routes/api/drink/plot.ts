import {getDb} from "$lib/db"
import type {EndpointOutput} from "@sveltejs/kit"
import simplify from "simplify-js"

interface Point {
	x: number,
	y: number
}

export async function get(): Promise<EndpointOutput> {
	const db = await getDb()
	const result = await db.collection('drink').find().sort({"device": 1, "time": 1}).toArray()

	let lines = []
	let dataAccel: Array<Point> = []
	let dataAccelDrink: Array<Point> = []
	let prev: any = {device: '', tag: null}

	result.push({x: 0, device: "end"})
	result.forEach((item) => {
		if ('x' in item) {
			if (item.device != prev.device) {
				createLine(lines, dataAccelDrink, prev.device + " Drinking", '#192')
				createLine(lines, dataAccel, prev.device, '#546')
				dataAccel = []
				dataAccelDrink = []
			}
			if (dataAccel.length > 0 && item.tag != prev.tag) {
				dataAccel.push(convertItem(item))
				dataAccelDrink.push(convertItem(item))
			} else if (item.tag == 'drink') {
				dataAccelDrink.push(convertItem(item))
			} else {
				dataAccel.push(convertItem(item))
			}
			prev = item
		}
	})

	return {body: lines}
}

function convertItem(item): Point {
	return {x: item.time, y: item.x + item.y + item.z}
}

function createLine(lines, data: Array<Point>, name: string, colour: string) {
	if (data.length > 1) {
		const lineSegments = []
		let currentSegment = []
		let prev = data[0].x
		data.forEach((item) => {
			if (Math.abs(prev - item.x) >= 1000) {
				lineSegments.push(simplify(currentSegment, 0.01, false))
				currentSegment = []
			}
			currentSegment.push(item)
			prev = item.x
		})

		let line = {
			x: [],
			y: [],
			mode: 'lines',
			name: name,
			line: {
				color: colour,
				width: 1
			}
		}
		lineSegments.forEach((segment) => {
			segment.forEach((point) => {
				line.x.push(new Date(point.x).toISOString())
				line.y.push(point.y)

			})
			line.x.push(null)
			line.y.push(null)
		})
		lines.push(line)
	}
}