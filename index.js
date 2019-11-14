const puppeteer     = require('puppeteer');
const express       = require('express');
const path          = require('path');
const hogan         = require('hogan-middleware');
const bodyParser    = require('body-parser');
const nodeFetch     = require('node-fetch');

const urlencodedParser = bodyParser.urlencoded({extended: false});

// Configuration d'express
const app = express()
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'mustache')
    .engine('mustache', hogan.__express);

// Grâce à Pupeteer, récupère les données de la page dans l'url et renvoie un objet Javascript
async function getGbData(){
    const dtUrl = 'https://deskthority.net/viewforum.php?f=50';
    
    // Lance le browser Chromium ({headless: false} == on voit la page se lancer, passer à true pour que ça se joue en background)
    const browser = await puppeteer.launch({headless: false});

    // On créer un nouvel onglet
    const page = await browser.newPage();

    // On accède à l'url et on attend une seconde que le page soit chargée
    await page.goto(dtUrl);
    await page.waitFor(1000);

    const gbData = await page.evaluate(() => {

        // Tableau qui recevra les données
        const gbs = [];
        const gbTitles = document.querySelectorAll('li.row');

        // Pour chaque gb, on récupère le titre, le lien ainsi que la date de post, et on insert ces infos dans le tableau gbs
        gbTitles.forEach(gbElement => {
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

    browser.close();
    
    // Englobe le résultat entre {} pour en faire un objet Javascript
    return {gbData};
};

async function getForecast(cityName){
	const apiKey = 'eaee5ae189087ccabdd90a4d194cbbf4';
    const city = cityName.trim();
    const apiLink = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const apiResult = await nodeFetch(apiLink);
    const weather = await apiResult.json();

    return {weather};
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