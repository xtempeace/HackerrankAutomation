//node HackerrankAutomationAgain.js --url="https://www.hackerrank.com" --config="config.json"

//npm i -y
//npm i minimist
//npm i puppeteer

let minimist=require("minimist");
let puppeteer=require("puppeteer");
let fs=require("fs");

let args=minimist(process.argv);
console.log(args.url);
console.log(args.config);

let configJSON=fs.readFileSync(args.config,"utf-8");
let configJSO=JSON.parse(configJSON);


run();

async function run()
{
  //Start the browser
  let browser=await puppeteer.launch({
    defaultViewport:null,
    args:[
     '--start-maximized'
    ],
    headless:false
  });

  //get a tab
  let pages=await browser.pages();
  let page=pages[0];

  //goto url
  await page.goto(args.url);

  //click on login1
  await page.waitForSelector("a[data-event-action='Login']");
  await page.click("a[data-event-action='Login']");

  //click on login2
  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
  await page.click("a[href='https://www.hackerrank.com/login']");

  //type userid
  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']",configJSO.userid);

  //type password
  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']",configJSO.password);

  await page.waitFor(3000);

  //click login3
  await page.waitForSelector("button[data-analytics='LoginPassword']");
  await page.click("button[data-analytics='LoginPassword']");

  //click on compete
  await page.waitForSelector("a[data-analytics='NavBarContests']");
  await page.click("a[data-analytics='NavBarContests']");

  //click on Manage Contests
  await page.waitForSelector("a[href='/administration/contests/']");
  await page.click("a[href='/administration/contests/']");

  //find pages
  await page.waitForSelector("a[data-attr1='Last']");
  let numPages=await page.$eval("a[data-attr1='Last']",function(atag){
    let np=parseInt(atag.getAttribute('data-page'));
    return np;
  })
  console.log(numPages);

  //move through all pages
  for(let i=0;i<numPages;i++)
  {
    await handlePage(browser,page);
  }

}

async function handlePage(browser,page)
{
    //work for 1 Page
    await page.waitForSelector("a.backbone.block-center");
    let curls=await page.$$eval("a.backbone.block-center",function(atags){
      let urls=[];
      for(let i=0;i<atags.length;i++)
      {
        let url=atags[i].getAttribute("href");
        urls.push(url);
      }
      return urls;
    });
    for(let i=0;i<curls.length;i++)
    {
      await handleContest(browser,page,curls[i]);
    }

    //move to next Page
    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
}

async function handleContest(browser,page,curl)
{
  let npage=await browser.newPage();
  await npage.goto(args.url+curl);
  await npage.waitFor(2000);
  
  await npage.waitForSelector("li[data-tab='moderators']");
  await npage.click("li[data-tab='moderators']");

  //await addModerator(npage);
  await removeModerator(npage);

  await npage.close();
  await page.waitFor(2000);
}

async function removeModerator(npage)
{
  console.log("Pre");
  await npage.waitForSelector(".remove-moderator");
  // let nOTags=await npage.$$eval(".remove-moderator",(atags)=>{
  //   console.log("************")
  //   // for(let i=0;i<atags.length;i++)
  //   // {
  //   //   // await npage.waitForSelector(atags[i].className);
  //   //   // await atags[i].click(atags[i].className )
  //   //   // await npage.waitFor(1500); 
  //   //   atags[i].click()
  
  //   // }

  //   atags.map((ele)=>{
  //     console.log()
  //         ele.click()
  //   })
  
  // });
  await npage.evaluate(()=>{
    [document.querySelectorAll('.remove-moderator')].map((e)=>e.click())
  })
  console.log("Pre");
  console.log("nOTags:"+nOTags);


}

async function addModerator(npage)
{
  await npage.waitForSelector("input#moderator");
  await npage.type("input#moderator",configJSO.moderators,{delay:50});
  await npage.keyboard.press("Enter");
}
