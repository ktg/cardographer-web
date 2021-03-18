// noinspection ES6UnusedImports
import type {SessionData} from 'express-session'

declare module 'express-session' {
	export interface SessionData {
		name: string,
		volunteer: boolean
	}
}

declare module '@sapper/server' {
	import {RequestHandler} from 'express'

	interface MiddlewareOptions {
		session?: (req: Express.Request, res: Express.Response) => unknown
		ignore?: unknown
	}

	function middleware(opts?: MiddlewareOptions): RequestHandler

	export {middleware}
}