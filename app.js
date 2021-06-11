const express = require("express");
const request = require("request");
const lodash = require("lodash")
var path = require("path");
const { render } = require("ejs");

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

//routes
app.get('/', (req,resp) => {
    request('https://xkcd.com/info.0.json', {json: true }, (err, res, body) => {
        if(res.statusCode === 200){
            if(err){
                resp.render("404");
            }
            var params = body.num;
            var frames = body.transcript.replace("[[", "FRAME:  ").replaceAll("[[", "\nFRAME:  ").replaceAll("]]", "").replace("{{alt text: ", "\nAlternate Title: ").replace("{{Alt text: ","\nAlternate Title: ").replace("{{ alt: ","\nAlternate Title: ").replace("}}", "").replaceAll("{{","").replaceAll("}}", "");
            var month = getMonthString(body.month);

            var date = month + " " + body.day + ", " + body.year;
            var nextURL = "/comics/" + (params+1);
            if(params+1 < params)
            {
                var nextURL = "/comics/" + (params+1);
            }
            else{
                var nextURL = "/";
            }
            
            if(params - 1 < 1)
            {
                var previousURL = "/comics/" + (params);
            }
            else
            {
                var previousURL = "/comics/" + (params-1);
            }
            resp.render("index", {dataObj: body, transcript:frames, date:date, nextURL:nextURL, previousURL:previousURL});

            resp.render("index", {dataObj: body});
        }
        else
            resp.render("404");
    })

})

app.get('/comics/:id', (req,resp) => {
    try{
    var params = parseInt(req.params.id);
    }
    catch{
        resp.render("404");
    }
    request('https://xkcd.com/info.0.json', {json: true }, (err, res1, body1) => {
        if(res1.statusCode === 200){
            if(err){
                resp.render("404");
            }
            var maxNum = body1.num;
            request('https://xkcd.com/'+ params +'/info.0.json', {json: true }, (err, res, body) => {
                if(res.statusCode === 200){
                    if(err){
                        console.log(err);
                    }
                    var frames = body.transcript.replace("[[", "FRAME:  ").replaceAll("[[", "\nFRAME:  ").replaceAll("]]", "").replace("{{alt text: ", "\nAlternate Title: ").replace("{{Alt text: ","\nAlternate Title: ").replace("{{ alt: ","\nAlternate Title: ").replace("}}", "").replaceAll("{{","").replaceAll("}}", "");
                    var month = getMonthString(body.month);

                    var date = month + " " + body.day + ", " + body.year;
                    var nextURL = "/comics/" + (params+1);
                    if(params+1 < params)
                    {
                        var nextURL = "/comics/" + (params+1);
                    }
                    else{
                        var nextURL = "/";
                    }

                    if(params - 1 < 1)
                    {
                        var previousURL = "/comics/" + (params);
                    }
                    else
                    {
                        var previousURL = "/comics/" + (params-1);
                    }
                    resp.render("index", {dataObj: body, transcript:frames, date:date, nextURL:nextURL, previousURL:previousURL});
                }
                else
                    resp.render("404");
            })
        }
        else
            resp.render("404");
    })        
})

app.get('/randomComic', (req,resp) => {
    request('https://xkcd.com/info.0.json', {json: true }, (err, res, body) => {
        if(res.statusCode === 200){
            if(err){
                resp.render("404");
            }
            var maxNum = body.num;
            var params = lodash.random(1,maxNum);
            request('https://xkcd.com/'+ params +'/info.0.json', {json: true }, (err2, res2, body2) => {
            if(res2.statusCode === 200){
                if(err2){
                    console.log(err);
                }
                var frames = body2.transcript.replace("[[", "FRAME:  ").replaceAll("[[", "\nFRAME:  ").replaceAll("]]", "").replace("{{alt text: ", "\nAlternate Title: ").replace("{{Alt text: ","\nAlternate Title: ").replace("{{ alt: ","\nAlternate Title: ").replace("}}", "").replaceAll("{{","").replaceAll("}}", "");
                var month = getMonthString(body2.month);
                var date = month + " " + body2.day + ", " + body2.year;
                var nextURL = "/comics/" + (params+1);
                if(params - 1 < 1)
                {
                    var previousURL = "/comics/" + (params);
                }
                else
                {
                    var previousURL = "/comics/" + (params-1);
                }
                resp.render("index", {dataObj: body2, transcript:frames, date:date, nextURL:nextURL, previousURL:previousURL});
            }
            else
                resp.render("404");
            })
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