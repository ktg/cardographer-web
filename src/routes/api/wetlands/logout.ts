import type {Request, Response} from 'express'

export async function post(req: Request, res: Response, _: () => void) {
	delete req.session.volunteer
	delete req.session.name
	res.json("success")
}