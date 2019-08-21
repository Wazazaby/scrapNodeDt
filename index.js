const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const hogan = require('hogan-middleware');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.engine('mustache', hogan.__express);
const dtUrl = 'https://deskthority.net/viewforum.php?f=50';

async function getGbData(){
  	let browser = await puppeteer.launch();
  	let page = await browser.newPage();
  	await page.goto(dtUrl);
  	await page.waitFor(1000);
  	
  	let gbData = await page.evaluate(() => {
  	    let gbs = [];
  		let gbTitles = document.querySelectorAll('li.row');
  		gbTitles.forEach((gbElement) => {
  			let gbJson = {};
  			try{
  				gbJson.title = gbElement.querySelector('a.topictitle').innerText.trim();
  				gbJson.linkTo = gbElement.querySelector('a.topictitle').href;
  				gbJson.posted = gbElement.querySelector('div.topic-poster').innerText.trim();
  			}catch(e){
  				console.log(e);
  			}

  			gbs.push(gbJson);
  		});

  		return gbs;
  	});

  	await browser.close();
  	return {gbData};
};

app.get('/', (req, res, next) => {
	res.render('index', null);
}).get('/group-buys', (req, res, next) => {
	(async() => {
		let data = await getGbData();
		res.render('index', data);
	})();
});

app.listen(8080);
console.log('Server runnin on post 8080 @ localhost:8080');