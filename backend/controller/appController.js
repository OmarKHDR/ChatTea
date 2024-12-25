
export default class appController {
	static checkStatus(req, res) {
		res.status(200).send('Server is up and running');
	}
	static checkStats(req, res) {
		res.status(200).send('Server is running with 100% CPU usage');
	}
}