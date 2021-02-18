import * as Mirada from 'mirada'
import type {Marker} from "./marker"
import {VideoReader} from "./camera"
import {MarkerDetector} from './markerDetector'
import type {Experience} from "./experience";

declare var cv: Mirada.CV

export enum State {
	loading,
	idle,
	scanning
}

class UI {
	readonly debugView?: Boolean = false
	readonly video: HTMLVideoElement
	readonly canvas: HTMLCanvasElement
	readonly deviceSelect: HTMLSelectElement
	readonly markerChanged: (marker: Marker) => void
	readonly stateChanged: (state: State) => void
}

export async function createScanner(experience: Experience, ui: UI): Promise<Scanner> {
	if (location.protocol != 'https:' && location.host != 'localhost') {
		throw Error("Artcodes requires https in order to access camera")
	}
	let opencvPath = '/opencv.js'
	const scripts = document.querySelectorAll<HTMLScriptElement>('script');
	scripts.forEach(el => {
		const index = el.src.indexOf('/artcodes.')
		if (index > 0) {
			opencvPath = el.src.slice(0, index) + '/opencv.js'
		}
	});

	await Mirada.loadOpencv({
		opencvJsLocation: opencvPath
	})

	const scanner = new Scanner(experience, ui)

	if (location.hash == '#play') {
		await scanner.start()
	} else {
		scanner.stop()
	}
	return scanner
}

export class Scanner {
	private readonly experience: Experience
	private readonly ui: UI
	private _state: State = State.loading
	private readonly camera: VideoReader
	private readonly fps: number = 10
	private currentMarker: Marker = null
	private readonly color = new cv.Scalar(255, 255, 0)
	private readonly detector

	constructor(experience: Experience, ui: UI) {
		this.experience = experience
		this.ui = ui

		this.detector = new MarkerDetector(experience)
		this.camera = new VideoReader(this.ui.video, this.ui.canvas, {
			video: {facingMode: 'environment'},
			audio: false
		});
		ui.stateChanged(State.loading)
	}

	private setState(newState: State) {
		this._state = newState
		this.ui.stateChanged(newState)
	}

	private selectListener = function (): void {
		this.camera.stop()
		this.camera.constraints = {
			video: {deviceId: this.ui.deviceSelect.value}
		}
		this.start()
	}.bind(this)

	get state(): State {
		return this._state
	}

	async start(): Promise<void> {
		if (this._state != State.scanning) {
			try {
				await this.camera.start()
				const dst = new cv.Mat(this.camera.width, this.camera.height, cv.CV_8UC1)
				let lastActionTime: number = 0
				const actionTimeout = 5000
				this.ui.stateChanged(State.scanning)
				this.ui.markerChanged(null)
				history.replaceState(null, null, '#play');

				const devices = await navigator.mediaDevices.enumerateDevices()
				this.ui.deviceSelect.removeEventListener('input', this.selectListener)
				while (this.ui.deviceSelect.options.length > 0) {
					this.ui.deviceSelect.remove(0);
				}
				const cameras = devices.filter(device => device.kind == 'videoinput')
				if (cameras.length > 1) {
					cameras.forEach(camera => {
						const opt = document.createElement('option');
						opt.value = camera.deviceId;
						opt.innerHTML = camera.label;
						this.ui.deviceSelect.appendChild(opt);
					})
					this.ui.deviceSelect.value = this.camera.deviceId
					this.ui.deviceSelect.addEventListener('input', this.selectListener)
					this.ui.deviceSelect.style.display = ''
				}

				const processVideo = () => {
					if (this.camera.isStreaming) {
						const begin = Date.now()
						const src = this.camera.read()
						cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY)
						cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, this.experience.settings.threshSize, this.experience.settings.threshConst)

						const contours = new cv.MatVector()
						const hierarchy = new cv.Mat()
						cv.findContours(dst, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

						if (this.ui.debugView == true) {
							cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGB)
						} else {
							cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB)
						}

						const marker = this.detector.findMarker(hierarchy)
						if (marker != null) {
							if (!marker.equals(this.currentMarker)) {
								this.currentMarker = marker
								this.ui.markerChanged(marker)
							}
							lastActionTime = Date.now() + actionTimeout
							cv.drawContours(dst, contours, marker.nodeIndex, this.color, 2, cv.LINE_8, hierarchy, 100)
						} else if (this.currentMarker != null && lastActionTime != 0 && Date.now() > lastActionTime) {
							lastActionTime = 0
							this.currentMarker = marker
							this.ui.markerChanged(null)
						}

						if (this.camera.shouldFlip) {
							cv.flip(dst, dst, 1)
						}
						cv.imshow(this.ui.canvas, dst)
						const delay = 1000 / this.fps - (Date.now() - begin)
						setTimeout(processVideo, delay)
					} else {
						dst.delete()
						this.setState(State.idle)
					}
				}

				processVideo()

			} catch (error) {
				console.log('error: ', error.message, error.name);
				console.trace(error)
				this.stop()
			}
		}
	}

	stop(): void {
		history.replaceState(null, null, ' ' + '')
		this.camera.stop()
		this.setState(State.idle)
	}
}