export class Action {
	readonly codes: Array<string>
	//readonly match: string
	readonly name: string
	//readonly showDetails: boolean
	readonly url: string
}

export class Settings {
	readonly threshSize: number = 101
	readonly threshConst: number = 1
}

export class Experience {
	readonly name: string
	readonly image: string
	readonly actions: Array<Action>
	readonly settings: Settings = new Settings()
	//readonly author: string
	//readonly description: string
	//readonly icon: string
}