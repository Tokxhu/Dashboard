self.addEventListener('install', (e) => {
	console.log('[SW]', 'Install')
})

self.addEventListener('activate', (e) => {
	console.log('[SW]', 'Activate')
})

self.addEventListener('fetch', (e) => {
	console.log('[SW]', 'Fetch')
})