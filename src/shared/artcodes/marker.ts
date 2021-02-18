import type {Action} from "./experience";

export class Marker {
	nodeIndex: number
	regions: number[]
	action: Action

	constructor(nodeIndex: number, regions: number[], action: Action) {
		this.nodeIndex = nodeIndex
		this.regions = regions
		this.action = action
	}

	equals(marker: Marker): boolean {
		return marker != null && (this.regions.length == marker.regions.length) && this.regions.every(function(element, index) {
			return element === marker.regions[index];
		});
	}
}