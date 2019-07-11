// const expect = require('chai').expect;

const assert = require('assert');
const { Given, When, Then,setDefaultTimeout } = require('cucumber');

var webdriver=require('selenium-webdriver'),
By = webdriver.By,
until = webdriver.until;
var imagePath;
var driver = new webdriver.Builder().forBrowser('chrome').build();
driver.manage().window().maximize();
setDefaultTimeout(30 * 5000);

var filepath1, filepath2;

  Given('Open chrome browser and start application', function () {
        return driver.get('https://www.online-calculator.com/full-screen-calculator/');
       });
  When(/^I enter following values and press CE button$/, async function (dataTable) {
        var strValue1=dataTable.raw()[0][1];
        var strValue2=dataTable.raw()[1][1];
        var strOperator=dataTable.raw()[2][1];
		//console.log("hello "+ strValue1);
		await driver.wait(until.titleIs('Full Screen Calculator - Online Calculator'), 5000);
		//console.log(await driver.getTitle());
		await driver.switchTo().frame(0);
		await driver.actions().
		sendKeys(strValue1).
		sendKeys(strOperator).
		sendKeys(strValue2).
		sendKeys(webdriver.Key.ENTER).
		perform();
		// takeScreenshot()
		filepath1 = await takeScreenshot();
		//console.log(filepath1);
      });
  Then(/^I should be able to see$/, async function (table) {
		var expectedValue = table.raw()[0][1];
		await driver.actions().
		sendKeys(expectedValue).
		perform();
		
		let x = function () { 
			takeScreenshot()
			.then(data => {
				filepath2 = data;
				return;
			}).catch( error => console.log(error)); 
		};
		await setTimeout(x,2000);
		await setTimeout(compareImage2,5000);
       });

Given('I Should see Full Screen Calculator', async function () {
	await driver.wait(until.titleIs('Full Screen Calculator - Online Calculator'), 5000);
});
When(/^I press CE button$/, async function (dataTable) {
	var strValue1=dataTable.raw()[0][1];
	//console.log("hello "+ strValue1);

	//console.log(await driver.getTitle());
	await driver.switchTo().frame(0);
	await driver.actions().
	sendKeys(strValue1).
	perform();
	// takeScreenshot()
	filepath1 = await takeScreenshot();
	//console.log(filepath1);
});
Then(/^I should be able to see$/, async function (table) {
	var expectedValue = table.raw()[0][1];
	await driver.actions().
	sendKeys(expectedValue).
	perform();

	let x = function () {
		takeScreenshot()
			.then(data => {
				filepath2 = data;
				return;
			}).catch( error => console.log(error));
	};
	await setTimeout(x,2000);
	await setTimeout(compareImage2,5000);
});
	   
function compareImage2() {
	var fc = require('filecompare');
	// const fs = require('fs');
	var cb = function(isEqual) {
		console.log("equal? :" + isEqual);
		assert.ok(isEqual);
	}
	fc(filepath1,filepath2,cb);
}
async function takeScreenshot(){
	const fs = require("fs");
    var now = new Date().getTime();
	imagePath="./reports/"+now+".tiff";
	var base64Data = "";
    var location = {};
    var bulk = [];
	try {
		if (fs.existsSync(imagePath)) {
			//file exists
		}
	} catch(err) {
		console.error(err)
	}

		driver.wait(until.elementLocated(By.id("canvas")), 5000);
		driver.findElement(By.id("canvas")).then(webElement => {
		//console.log("0");
		return webElement.getRect();
	}).then(e => {
		location.x = e.x;
		location.y = e.y;
		location.height = e.height;
		location.width = e.width;
		//console.log("1");
	}).then(_ => {
		//console.log("2");
		return driver.manage().window().getRect();
	}).then(e => {
		location.browserHeight = e.height;
		location.broserWidth = e.width;
		//console.log("3");
	}).then(_ => {
		//console.log("4");
        return driver.takeScreenshot();
	}).then(data => {
		base64Data = data.replace(/^data:image\/png;base64,/, "");
		//console.log("5");
		return base64Data;
	}).then(base64Data => {
		const sizeLimit = 700000; // around 700kb
        const imgSize = base64Data.length;
		for (var i = 0; i < imgSize; i += sizeLimit) {
                bulk.push(base64Data.substring(i, i + sizeLimit));
		}
		//console.log("6="+imgSize);
	}).then(_ => {
		driver.executeScript(() => {
            window.temp = new Array;
			//document.body.innerHTML += "01"
        })
		//console.log("7");
	}).then(_ => {
		bulk.forEach((element, index) => {
			driver.executeScript(() => {
				window.temp[arguments[0]] = arguments[1];
				//document.body.innerHTML += "02"
			}, index, element);
		})
		//console.log("8="+bulk.length);
	}).then(_ => {
        return driver.executeScript(() => {
			//document.body.innerHTML += "03"
            var tempBase64 = window.temp.join("");
            var image = new Image();
            var location = arguments[0];
            image.src = "data:image/png;base64," + tempBase64;
            image.onload = function () {
				//document.body.innerHTML += "03.5"
                var canvas = document.createElement("canvas");
                canvas.height = location.height;
                canvas.width = location.width;
                canvas.style.height = location.height + 'px';
                canvas.style.width  = location.width + 'px';
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, -location.x, -location.y);
                window.canvasData = canvas.toDataURL();
                window.temp = [];
            }			
        }, location);
    }).then(x => {
		//console.log("10");
		return driver.executeScript(() => {
			//document.body.innerHTML += "04"
            var data = window.canvasData;
            window.canvasData = "";
            return data;
        })
	}).then(data => {
		//console.log("11");
        var tempData = data.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(imagePath, tempData, "base64");
    }).catch( error => console.log(error));
	return imagePath;

}