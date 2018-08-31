var mongo=require('mongodb').MongoClient;
var url="mongodb://localhost:27017/mydb";

mongo.connect(url,function(err,db){
  if(err)
    throw err;
  console.log("DATABASE CREATED");
  var dbo=db.db("urlDatabase");

  console.log("CLEARING TABLE IF IT EXISTS");
  dbo.collection("urldata").remove({},function(err,result){
    if(err)
      throw err;
    dbo.createCollection("urldata",function(err,result){
      if(err)
        throw err;
      console.log("TABLE CREATED");
      dbo.collection("urldata").insertOne({given:"abc",short:0},function(err,result){
        if(err)
          throw err;
        console.log("AN ENTRY IS INSERTED");
        db.close();
      });
    });
  });
});
