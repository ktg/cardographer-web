import fs from 'fs'
import fetch from 'node-fetch'

const drinkSuffix = "_drink"

async function prepare() {
	fs.mkdirSync('sessions/drinking', {recursive: true})
	fs.mkdirSync('sessions/notDrinking', {recursive: true})

	const response = await fetch("https://cardographer.cs.nott.ac.uk/api/drink/list")
	if (!response.ok) {
		throw Error("" + response.status + ": " + response.statusText)
	}

	let sessions = {}

	const data = await response.json()
	data.forEach((line) => {
		if ('x' in line) {
			let session = line.device
			if (line.tag === 'drink') {
				session = line.device + drinkSuffix
			}
			if (!(session in sessions)) {
				sessions[session] = {
					"writeCount": 0,
					"count": 0,
					"timestamp": 0,
					"lines": []
				}
			}
			sessions[session].lines.push(line)
		} else {
			const device = line.device.slice(-5)
			const drinkSession = device + drinkSuffix
			writeSession(device, false, sessions[device], line.hand)
			writeSession(device, true, sessions[drinkSession], line.hand)
		}
	});
}

async function writeSession(device, drink, session, hand) {
	if (session) {
		session.lines.forEach((line) => {
			if (line.time - session.timestamp > 500) {
				if (session.file != null) {
					fs.closeSync(session.file)
					if (session.writeCount < 25) {
						fs.rmSync(session.filename)
						session.count--
					}
				}
				session.writeCount = 0
				session.count++
				session.filename = "sessions/notDrinking/" + device + "_" + session.count + ".csv"
				if (drink) {
					session.filename = "sessions/drinking/" + device + "_" + session.count + ".csv"
				}

				session.file = fs.openSync(session.filename, 'w')
				fs.writeSync(session.file, "timestamp, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, right_hand\n")
			}
			fs.writeSync(session.file, [
				line.time,
				line.x, line.y, line.z,
				line.rx, line.ry, line.rz,
				hand === 'right' ? 1 : 0
			].join(", "))
			fs.writeSync(session.file, "\n")
			session.timestamp = line.time
			session.writeCount++
		})
		session.lines = []
	}
}

prepare()