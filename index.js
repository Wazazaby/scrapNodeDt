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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(dtUrl);
    await page.waitFor(1000);
  	
    const gbData = await page.evaluate(() => {
  	    const gbs = [];
  		const gbTitles = document.querySelectorAll('li.row');
  		gbTitles.forEach((gbElement) => {
  			try{
                const gbJson = {
                    title: gbElement.querySelector('a.topictitle').innerText.trim(),
                    linkTo: gbElement.querySelector('a.topictitle').href,
                    posted: gbElement.querySelector('div.topic-poster').innerText.trim()
                };

                gbs.push(gbJson);
  			}catch(e){
  				console.log(e);
  			}
  		});

  		return gbs;
  	});

  	await browser.close();
  	return {gbData};
};

app.get('/', (req, res, next) => {
	res.render('index', null);
}).get('/group-buys', async (req, res, next) => {
	const data = await getGbData();
	res.render('index', data);
});

app.listen(8080);
console.log('Server runnin on post 8080 @ localhost:8080');