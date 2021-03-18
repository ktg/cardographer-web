import type {Request, Response} from 'express'

export async function post(req: Request, res: Response, _: () => void) {
	try {
		let {name, password} = req.body
		if (password == 'test') {
			req.session.name = name
			req.session.volunteer = true
			res.status(200).json("success")
		} else {
			res.status(401).json({error: 'Unauthorized'})
		}
	} catch (error) {
		console.log('Error (signup)', error);
		res.status(500).json({error: error})
	}
}