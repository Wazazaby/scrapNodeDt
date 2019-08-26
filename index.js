const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const hogan = require('hogan-middleware');
const bodyParser = require('body-parser');
const nodeFetch = require('node-fetch');
//const request = require('request');

const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.engine('mustache', hogan.__express);

async function getGbData(){
	const dtUrl = 'https://deskthority.net/viewforum.php?f=50';
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

async function getForecast(cityName){
	const apiKey = 'eaee5ae189087ccabdd90a4d194cbbf4';
	const city = cityName.trim();
	const apiLink = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;
    //au lieu de ça, tu peux utiliser node-fetch
    const apiResult = await nodeFetch(apiLink).then((res) => {
        return res.json();
    });

    console.log(apiResult);
    return apiResult;
}

app.get('/', (req, res, next) => {
	res.render('index', null);
}).get('/group-buys', async (req, res, next) => {
	const data = await getGbData();
	res.render('group-buys', data);
}).get('/forecast', (req, res, next) => {
	res.render('forecast', null);
}).post('/forecast', urlencodedParser, async (req, res, next) => {
	const data = await getForecast(req.body.ville);
    res.render('forecast', data);
}).listen(8080);
console.log('Server running on port 8080 @ localhost:8080');