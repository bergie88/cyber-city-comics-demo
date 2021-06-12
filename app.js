const express = require("express");
const request = require("request");
const lodash = require("lodash")
var path = require("path");
const { render } = require("ejs");
let idCounts = new Map();
//app
const app = express();
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
var staticDir = path.join(__dirname, "public");
console.log(staticDir);
app.use(express.static(staticDir));

//functions
function getMonthString (month){
    switch(month){
        case "1":
          return "January";
          case "2":
          return "February";
          case "3":
          return "March";
          case "4":
          return "April";
          case "5":
          return "May";
          case "6":
          return "June";
          case "7":
          return "July";
          case "8":
          return"August";
          case "9":
          return "September";
          case "10":
          return "October";
          case "11":
          return "November";
          case "12":
          return "December";
          default:
            return "";
      };
}

function countPageView(params, idcounts){
    if(idCounts.has(params))
    {
        idcounts.get(params).val++;
    }
    else
    {
        idcounts.set(params,{val:1});
    }
    return idcounts.get(params).val
}


function setPrevURL(params){
    if(params - 1 < 1)
    {
        return "/comics/" + (params);
    }
    else
    {
        return "/comics/" + (params-1);
    }
}

function loadPageData(resp, params, maxNum){
    if(params == 0)
        var link = 'https://xkcd.com/info.0.json';
    else
        var link = 'https://xkcd.com/'+ params +'/info.0.json'
    request(link, {json: true }, (err, res, body) => {
        if(res.statusCode === 200){
            if(err){
                return resp.render("404");
            }
            var pageNum = body.num;
            var nextURL;
            if(params == 0 || pageNum ==maxNum)
                nextURL = "/";
            else
                nextURL = "/comics/" + (params+1)
            console.log(params , " " ,maxNum, " ",  pageNum);
            var frames = body.transcript.replace("[[", "FRAME:  ").replaceAll("[[", "\nFRAME:  ").replaceAll("]]", "").replace("{{alt text: ", "\nAlternate Title: ").replace("{{Alt text: ","\nAlternate Title: ").replace("{{ alt: ","\nAlternate Title: ").replace("}}", "").replaceAll("{{","").replaceAll("}}", "");
            var month = getMonthString(body.month);
            var date = month + " " + body.day + ", " + body.year;
            return resp.render("index", {dataObj: body, transcript:frames, date:date, nextURL:nextURL, previousURL:setPrevURL(pageNum), pageCount:countPageView(pageNum, idCounts)});
        }
        else
            return resp.render("404");
    })
}


//routes
app.get('/', (req,resp) => {
    loadPageData(resp, 0, 0);
})

app.get('/comics/:id', (req,resp) => {
    try{var params = parseInt(req.params.id);}
    catch{resp.render("404");}

    request('https://xkcd.com/info.0.json', {json: true }, async (err, res1, body1) => {
        if(res1.statusCode === 200){
            if(err){
                resp.render("404");
            }
            var maxNum = await body1.num;
            loadPageData(resp, params, maxNum);
        }
        else
            resp.render("404");
    })        
})

app.get('/randomComic', (req,resp) => {
    request('https://xkcd.com/info.0.json', {json: true }, async( err, res, body) => {
        if(res.statusCode === 200){
            if(err){
                resp.render("404");
            }
            var maxNum = await body.num;
            var params = lodash.random(1,maxNum);
            loadPageData(resp,params,maxNum);
        }
        else
        {
            const defaultData = {title: "Hi There", img: ""};
            resp.render("index", {dataObj: defaultData} )
        }
    })
    
})

//listen for requests
app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});