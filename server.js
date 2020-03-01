require('dotenv').config()

const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
const si = require('systeminformation');
const cors = require('cors')

app.use(cors())
app.use(cookieParser())
app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

app.use(express.static('./public'))

const auth = require('./middlewares/auth')

app.get('/login',
	// 	(req, res, next) => {
	// 	if (req.cookies.devSiteToken) res.clearCookie()
	// 	next();
	// },
	(req, res) => {
		res.render('pages/login')
	})

app.post('/login', (req, res) => {
	try {
		let { password } = req.body
		if (!password)
			throw new Error("No password")

		let hash = crypto
			.createHash("sha256")
			.update(password)
			.update(process.env.SECRET)
			.digest('hex')

		if (hash !== process.env.PASSWORD) throw new Error("Wrong password")
		res.cookie('devSiteToken', hash, {
			maxAge: new Date(60 * 60 * 1000 * 6),
			path: '/'
		}).sendStatus(200)
	} catch (err) {
		res.status(403).send(err.message)
	}
})

app.use(auth)

let links = [
	{
		name: 'sonarr',
		url: 'http://localhost:8989',
		type: 'proxy'
	},
	{
		name: 'qbt',
		url: 'http://localhost:8080',
		type: 'proxy'
	},
	{
		name: 'radarr',
		url: 'http://localhost:7878',
		type: 'proxy'
	},
	{
		name: 'jackett',
		url: 'http://localhost:9117',
		type: 'proxy'
	},
	{
		name: 'webhooks',
		url: '/webhooks',
		type: 'sublink'
	},
	{
		name: 'dashboard',
		url: '/',
		type: 'sublink'
	},
	{
		name: 'settings',
		url: '/settings',
		type: 'sublink'
	}
].sort((a, b) => a.name.localeCompare(b.name))

let getReadableFileSizeString = (fileSizeInBytes) => {
	let i = -1;
	let byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	do {
		fileSizeInBytes = fileSizeInBytes / 1024;
		i++;
	} while (fileSizeInBytes > 1024);

	return {
		size: Math.max(fileSizeInBytes, 0.1).toFixed(1),
		prefix: byteUnits[i]
	};
};

let getHW = async () => {
	let harddrives = (await si.fsSize())
		.map(({ fs, mount, use, size, used }, i) => {
			used = getReadableFileSizeString(used).size;
			size = getReadableFileSizeString(size);
			let prefix = size.prefix
			size = size.size;
			return { index: i, fs, mount, use, size, used, prefix }
		})
	let cpuTemp = (await si.cpuTemperature()).main
	let memUsage = await si.mem();

	return {
		harddrives,
		cpuTemp,
		memUsage
	}
}

const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({
	xfwd: true
})
	.on('error', (err, req, res) => res.send(400, err))
	.on('proxyReq', (proxyReq, req, res, options) => {
		if (proxyReq.path.startsWith('/qbt')) proxyReq.path = `/${proxyReq.path.split('/').slice(2).join('/')}`
	});

for (let index in links) {
	let { name, url, type } = links[index];
	if (type === 'proxy') {
		app.all(`/${name}/*`, (req, res) => {
			proxy.web(req, res, { target: url })
		})
		app.all(`/${name}`, (req, res) => res.redirect(`/${name}/`))
	} else if (type === 'sublink') {
		app.get(url, auth, async (req, res) => {
			let hw = await getHW()
			res.render(`pages/${name}`, {
				links,
				hw
			})
		})
	}
	links[index].url = type === 'proxy' ? `/${name}/` : url
}

const nunjucks = require('nunjucks')
nunjucks.configure(process.cwd() + '/views', {
	express: app,
	autoescape: true,
	watch: process.env.NODE_ENV === "development"
});

app.set('view engine', 'html');

app.get('/hwinfo', async (req, res) => {
	res.send(await getHW())
})

let server = app.listen(process.env.PORT, async () => {
	console.log(`Running on ::${process.env.PORT}`)
})

process.on('SIGINT', async () => {
	console.log("Closing...")
	server.close()
	process.exit();
})