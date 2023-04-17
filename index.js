const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");


const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));


//let listName = "All items";
let listName = "";


const itemsSchema = new mongoose.Schema({
  name: String,
  list: String,
  checked: { type : Boolean, default: false },
  deleted: { type : Boolean, default: false }
});

//the model to use the item schema
const Item_m = mongoose.model("Item", itemsSchema);


app.get("/", async function(req, res) {
  console.log("In default get");
  const lists = await Item_m.distinct("list", {"deleted":"false"});
  //want to have the first list selected if 

  if (listName =="") {
    console.log("Listname is blank");
    //find the first and select it
    if (lists.length > 0) {
      //there is a list to select from
      console.log("Setting list name to " + lists[0]);
      listName = lists[0];

      const items = await Item_m.find({list:listName, deleted:false});
    
      res.render("simple_list_test", {listTitle: listName, newListItems: items, uniqueLists:lists});
    
  
    } else {
      //if there are no lists, go to the create new list page
      console.log("No lists found");
       //note: this hasnt been tested as database has records.
      res.render("newList", {listWarning: undefined, item: undefined});
    }
  } else {

    const items = await Item_m.find({list:listName, deleted:false});
        
    console.log("List name not blank it =" + listName);
  
    res.render("simple_list_test", {listTitle: listName, newListItems: items, uniqueLists:lists});
  }

});

app.post("/", async function(req, res){

  const item = req.body.newItem;

  console.log("Item text = " + item);

  //listName is a stored variable
  const newItem = await Item_m.create({ list: listName, name: item, "$set":{"checked":false}, "$set":{"deleted":false}})
  .then(function (newItem) {
    res.redirect("/");
  })
  .catch(function (err) {
    console.log(err);
  });
  

});

app.get("/addnewList", function (req, res)  {
  //create a new list with a new item in the list
  console.log("creating new list");

  res.render("newList", {listWarning: undefined, item: undefined});
  //res.render("newList");

  //res.redirect("/");
});

app.post("/addnewList", async function (req, res)  {
  //add new list and item
  console.log("creating new list");

  let listNewName = req.body.listname;
  let newItem1 = req.body.newItem;

//  console.log("Listname = " + listNewName);
//  console.log("Item = " + newItem1);

  if (listNewName == "" || newItem1 == "") {
    //no input, just bail back to home page
 //   console.log("no input bail out ");
    res.redirect("/");
  } else {

      //dont want to add the new list if it exists already
    const items = await Item_m.find({list:listNewName, deleted:false});
    
    if (items.length > 0) {
      console.log("List exists");
      res.render("newList", {listWarning:listNewName, item:newItem1});
    }  else {

      const newItem = await Item_m.create({ list: listNewName, name: newItem1, "$set":{"checked":false}, "$set":{"deleted":false}})
      .then(function (newItem) {

        listName = listNewName;
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
    
    }

  }


  
});

app.get("/list/:list", async function (req, res)  {
  //get a different list
  
  let listName = req.params.list;
  console.log("Different list requested  app.get(/list/:list"  + listName);
  console.log("listName variable  =  " + listName);
  res.redirect("/");
});

//app.get("/itemChangeCheckedStatus/:item", function (req, res)  {

//this works but it should be a post method because data is changing
/*   app.get("/itemChangeCheckedStatus", function (req, res)  {

   // console.log("query " + req.url);    //ths works


    const url = require('url');
    const querystring = require('querystring');

    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);

    let idOfItem = parsedQs.checkbox

    // have the id of the checkbox now can read the value and flip it

    //console.log("parsedQs " + parsedQs);
    res.send("idOfItem = " + idOfItem);
}); */


app.post("/itemChange", async function (req, res)  {

  let checkBoxID = req.body.changeCheckedStatus;

  let deleteButtonID = req.body.deleteButton;

/*   console.log("Checkbox ID = " + checkBoxID);
  console.log("deleteButtonID = " + deleteButtonID); */


  if (checkBoxID != undefined) {
    //The checkbox to change the checked status has been selected

   // const newItemupdateItem = await Item_m.updateOne({_id: checkBoxID, checked: "false"})

    const newItemupdateItem = await Item_m.updateOne(
      { _id: checkBoxID },
      [ { "$set": { "checked": { "$eq": [false, "$checked"] } } } ]
      )
    //console.log("Count of updated records = " + newItemupdateItem.modifiedCount);
  } else {
    //the only other thing to do on the form is to delete an item
    if (deleteButtonID != undefined) {
      const itemupdateItem = await Item_m.updateOne(
        { _id: deleteButtonID},  {"$set":{"deleted":true}})
     
    }
  }
  res.redirect("/")

  

/*   const url = require('url');
  const querystring = require('querystring');

  let parsedUrl = url.parse(req.url);
  let parsedQs = querystring.parse(parsedUrl.query);

  let idOfItem = parsedQs.checkbox

  // have the id of the checkbox now can read the value and flip it

  //console.log("parsedQs " + parsedQs);
  res.send("idOfItem = " + idOfItem); */


});



const db = async () => {
    try {

      const conn = await mongoose.connect('mongodb+srv://DD_1:DD_1_PW@cluster1.eiy6kz9.mongodb.net/test');
      
      console.log("MonoDB Connected: " + conn.connection.host);
        
      } catch (error) {
      console.log(error);
      preocces.exit(1);
    }
}

db().then(() => {
    app.listen(process.env.PORT || 3000, function(){
      console.log("server is running on port "+ PORT)
    })
});
