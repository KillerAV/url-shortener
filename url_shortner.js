//PACKAGES
var express=require('express');
var app=require('express')();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var mongo=require('mongodb').MongoClient;
var url="mongodb://localhost:27017/mydb";

//GLOBAL VARIABLES
var answer;
var count;

app.use(express.static(__dirname));
io.on('connection',function(socket){
	socket.emit('sendingurl',JSON.stringify(answer));
});

io.on('connection',function(socket){
	socket.emit('sendingcount',JSON.stringify(count));
});

app.get("/",function(req,res){
  console.log("OPEN FORM");
	mongo.connect(url,function(err,db){
		if(err)
			throw err;
		var dbo=db.db("urlDatabase");
		dbo.collection("urldata").find({}).toArray(function(err,result){
				if(err)
					throw err;
				count={count: result.length};
				db.close();
				res.sendFile(__dirname + '/url_form.html');
		});
	});
});

app.post("/form",function(req,res){
  console.log("GET FORM INPUT");
  var formidable=require('formidable');
  var form=new formidable.IncomingForm();
  form.parse(req,function(err,fields,files){
    if(err)
      throw err;

    console.log("CHECKING URL IN AVAILABLE DATABASE")
    var findobj={given: fields.givenurl};
    mongo.connect(url,function(err,db){
      if(err)
        throw err;
      var dbo=db.db("urlDatabase");
      dbo.collection("urldata").find(findobj).toArray(function(err,result){
        if(err)
          throw err;
        if(result.length==0)
        {
          console.log("URL NOT AVAILABLE")
          console.log("CREATING A SHORT URL");
          dbo.collection("urldata").find({}).sort({short:1}).toArray(function(err,result){
            if(err)
              throw err;
            var last_inserted=result[result.length-1].short;
            var newobj={given: fields.givenurl, short: last_inserted+1};
            dbo.collection("urldata").insertOne(newobj,function(err,result){
              if(err)
                throw err;
              console.log("SHORT URL CREATED");
              answer=newobj;
              db.close();
              res.sendFile(__dirname + "/final_page.html");
            });
          });
        }
        else
        {
            answer=result[0];
            db.close();
            res.sendFile(__dirname + "/final_page.html");
        }
      });
    });
  });
});

app.get("/s/:id",function(req,res){
  var findobj={short:parseInt(req.params.id)};
  mongo.connect(url,function(err,db){
    if(err)
      throw err;
    var dbo=db.db("urlDatabase");
    dbo.collection("urldata").find(findobj).toArray(function(err,result){
      if(err)
        throw err;
      var open=require("open");
      open(result[0].given,"chrome");
      res.send("TASK ACHIEVED");
      db.close();
      });
  });
});

http.listen(8080);
