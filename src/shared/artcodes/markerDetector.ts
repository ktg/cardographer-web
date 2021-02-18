import type * as Mirada from 'mirada'
import {Marker} from "./marker";
import type {Experience, Action} from "./experience";

const NEXT_NODE = 0;
//const PREV_NODE = 1;
const FIRST_CHILD_NODE = 2;

//const PARENT_NODE = 3;

class MarkerCode {
	readonly code: Array<number>
	readonly action: Action

	constructor(code: Array<number>, action: Action) {
		this.code = code
		this.action = action
	}
}

export class MarkerDetector {
	private readonly maxRegions: number
	private readonly minRegions: number
	private readonly maxValue: number
	private readonly minValue: number

	private readonly experience: Experience
	private readonly codes: Array<MarkerCode>

	constructor(experience: Experience) {
		this.experience = experience
		let codes = Array<MarkerCode>()
		let minValue = 20
		let maxValue = 1
		let maxRegions = 20
		let minRegions = 1
		experience.actions.forEach(action => {
			action.codes.forEach(code => {
				const markerCode = new MarkerCode(code.split(':').map((value) => {
					return Number.parseInt(value)
				}), action)
				codes.push(markerCode)
				maxRegions = Math.min(markerCode.code.length, maxRegions)
				minRegions = Math.max(markerCode.code.length, minRegions)
				markerCode.code.forEach((value) => {
					minValue = Math.min(value, minValue)
					maxValue = Math.max(value, maxValue)
				})
			})
		})
		this.codes = codes
		this.maxRegions = maxRegions
		this.minRegions = minRegions
		this.maxValue = maxValue
		this.minValue = minValue
		//console.log(this)
	}

	findMarker(hierarchy: Mirada.Mat) {
		for (let i = 0; i < hierarchy.cols; ++i) {
			let result = this.createMarkerForNode(i, hierarchy)
			if (result != null) {
				return result;
			}
		}
	}

	private static getFirstChild(hierarchy: Mirada.Mat, nodeIndex: number): number {
		return (hierarchy.intPtr(0, nodeIndex) as Int32Array)[FIRST_CHILD_NODE]
	}

	private static getNextNode(hierarchy: Mirada.Mat, nodeIndex: number): number {
		return (hierarchy.intPtr(0, nodeIndex) as Int32Array)[NEXT_NODE]
	}

	private createMarkerForNode(nodeIndex: number, hierarchy: Mirada.Mat) {
		let regions: number[] = []

		let currentNodeIndex = MarkerDetector.getFirstChild(hierarchy, nodeIndex)
		while (currentNodeIndex >= 0) {
			let leafs = this.countLeafs(currentNodeIndex, hierarchy)
			if (leafs != null) {
				if (regions.length >= this.maxRegions) {
					return null
				}

				regions.push(leafs)
			} else {
				return null
			}
			currentNodeIndex = MarkerDetector.getNextNode(hierarchy, currentNodeIndex);
		}

		if (regions.length < this.minRegions) {
			return null
		}

		regions.sort()
		for (let code of this.codes) {
			let is_same = (code.code.length == regions.length) && code.code.every((element, index) => element === regions[index]);
			if (is_same) {
				return new Marker(nodeIndex, regions, code.action);
			}
		}
		return null;
	}

	private countLeafs(nodeIndex: number, hierarchy: Mirada.Mat): number {
		let leafCount = 0;
		let currentNodeIndex = MarkerDetector.getFirstChild(hierarchy, nodeIndex)
		while (currentNodeIndex >= 0) {
			if (MarkerDetector.getFirstChild(hierarchy, currentNodeIndex) >= 0) {
				return null;
			}
			leafCount++
			if (leafCount > this.maxValue) {
				return null;
			}
			currentNodeIndex = MarkerDetector.getNextNode(hierarchy, currentNodeIndex);
		}

		if (leafCount < this.minValue) {
			return null;
		}

		return leafCount;
	}
}
