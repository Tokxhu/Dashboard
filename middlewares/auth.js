module.exports = (req, res, next) => {
	if (req.cookies.devSiteToken === process.env.PASSWORD) next();
	else res.redirect('/login')
}
