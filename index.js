
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");


const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));


const db = async () => {
  try {
    //console.log("In db conn before setting connection. Listname = " + listName);
    //live site
    const conn = await mongoose.connect('mongodb+srv://DD_1:DD_1_PW@cluster1.eiy6kz9.mongodb.net/test');


    //loocal site
    //const conn = await mongoose.connect('mongodb://127.0.0.1/test');
    //console.log("In db conn after setting connection. Listname = " + listName);
    console.log("MonoDB Connected: " + conn.connection.host);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

//let listName = "All items";
//let listName;


const itemsSchema = new mongoose.Schema({
  name: String,
  list: String,
  checked: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
});

//the model to use the item schema
const Item_m = mongoose.model("Item", itemsSchema);


app.get("/", async function (req, res) {

  console.log("In home get");
  const lists = await Item_m.distinct("list", { "deleted": "false" });
  //want to have the first list selected if 
  //console.log(" listName variable = " + listName);

  //if the home route is triggered, return the first list in the collection

  //console.log("Listname is blank");
  //find the first and select it
  if (lists.length > 0) {
    //there is a list to select from
    console.log("   Initial list name is  " + lists[0]);
    //listName = lists[0];

    const items = await Item_m.find({ list: lists[0], deleted: false });

    // res.render("simple_list_test", { listTitle: lists[0], newListItems: items, uniqueLists: lists });
    res.render("display_items_in_list", { listTitle: lists[0], newListItems: items, uniqueLists: lists });



  } else {
    //if there are no lists, go to the create new list page
    console.log("No lists found");
    //note: this hasnt been tested as database has records.
    res.render("newList", { listWarning: undefined, item: undefined });
  }

});

app.post("/", async function (req, res) {

  const item = req.body.newItem;
  const listTitle = req.body.list;

  console.log("___________________");
  console.log("Posting new item");
  console.log("   Item text = " + item);
  console.log("   List name = " + listTitle);
  console.log("___________________");

  const lists = await Item_m.distinct("list", { "deleted": "false" });

  //listName is a stored variable
  const newItem = await Item_m.create({ list: listTitle, name: item, "$set": { "checked": false }, "$set": { "deleted": false } });
  const items = await Item_m.find({ list: listTitle, deleted: false });

  // res.render("simple_list_test", { listTitle: listTitle, newListItems: items, uniqueLists: lists });
  res.render("display_items_in_list", { listTitle: listTitle, newListItems: items, uniqueLists: lists });

  //    res.redirect("/");


});

// Dont think this is needed anymore
// app.get("/addnewList", function (req, res) {
//   //create a new list with a new item in the list
//   console.log("creating new list");
//   res.render("newList", { listWarning: undefined, item: undefined });
// });

app.post("/addnewList", async function (req, res) {
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
    const items = await Item_m.find({ list: listNewName, deleted: false });

    if (items.length > 0) {
      console.log("List exists");
      res.render("newList", { listWarning: listNewName, item: newItem1 });
    } else {

      const newItem = await Item_m.create({ list: listNewName, name: newItem1, "$set": { "checked": false }, "$set": { "deleted": false } });

      const items = await Item_m.find({ list: listNewName, deleted: false });

      const lists = await Item_m.distinct("list", { "deleted": "false" });

      res.render("display_items_in_list", { listTitle: listNewName, newListItems: items, uniqueLists: lists });

/*       const newItem = await Item_m.create({ list: listNewName, name: newItem1, "$set":{"checked":false}, "$set":{"deleted":false}})
      .then(function (newItem) {

        listName = listNewName;
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });
 */    }
  }
});

app.get("/list/:list", async function (req, res) {
  //get a different list

  console.log("In app.get(/list/:list ");
  console.log("   req.params.list = " + req.params.list);

  listName = req.params.list;
  console.log("listName variable  =  " + listName);

  const items = await Item_m.find({ list: listName, deleted: false });

  const lists = await Item_m.distinct("list", { "deleted": "false" });

  console.log("Rendering list directly from list/:list");

  // res.render("simple_list_test", {listTitle: listName, newListItems: items, uniqueLists:lists});
  res.render("display_items_in_list", { listTitle: listName, newListItems: items, uniqueLists: lists });

});

app.post("/itemChangeCheckedStatus", async function (req, res) {

  console.log("*************");
  console.log("  In item change");

  let checkBoxID = req.body.changeCheckedStatus;

  //  let deleteButtonID = req.body.deleteButton;

  console.log("Checkbox ID = " + checkBoxID);

  const newItemupdateItem = await Item_m.updateOne(
    { _id: checkBoxID },
    [{ "$set": { "checked": { "$eq": [false, "$checked"] } } }]
  )
  //console.log("Count of updated records = " + newItemupdateItem.modifiedCount);

  const listTitle = req.body.listName;
  console.log("  List title = " + listTitle);
  const items = await Item_m.find({ list: listTitle, deleted: false });

  const lists = await Item_m.distinct("list", { "deleted": "false" });

  res.render("display_items_in_list", { listTitle: listTitle, newListItems: items, uniqueLists: lists });


  //  res.redirect("/")



  /*   const url = require('url');
    const querystring = require('querystring');
  
    let parsedUrl = url.parse(req.url);
    let parsedQs = querystring.parse(parsedUrl.query);
  
    let idOfItem = parsedQs.checkbox
  
    // have the id of the checkbox now can read the value and flip it
  
    //console.log("parsedQs " + parsedQs);
    res.send("idOfItem = " + idOfItem); */


});

app.post("/deleteItem/:item", async function (req, res) {
  console.log("*************");
  console.log("  Item delete");
  let deleteButtonID = req.body.deleteButton;
  const listTitle = req.body.listName;
  console.log("  List title = " + listTitle);

  console.log("   Delete button = " + deleteButtonID);
  //mark the item as deleted
  const itemupdateItem = await Item_m.updateOne({ _id: deleteButtonID }, { "$set": { "deleted": true } })




  const items = await Item_m.find({ list: listTitle, deleted: false });

  const lists = await Item_m.distinct("list", { "deleted": "false" });

  res.render("display_items_in_list", { listTitle: listTitle, newListItems: items, uniqueLists: lists });
});

app.post("/updateItem/:item", async function (req, res) {
  console.log("*************");
  console.log("  update delete");
  let updateButtonID = req.body.updateButton;
  let itemRaw = req.body.text;
  let item = itemRaw.trim();

  const listTitle = req.body.listName;
  console.log("  List title = " + listTitle);
  console.log("   ItemID to update  = " + updateButtonID);
  console.log("   Item text to update  =" + item);

  const itemupdateItem = await Item_m.updateOne({ _id: updateButtonID }, { "$set": { "name": item } })

  const items = await Item_m.find({ list: listTitle, deleted: false });
  // console.log("   Items added  =" + items);
  const lists = await Item_m.distinct("list", { "deleted": "false" });

  res.render("display_items_in_list", { listTitle: listTitle, newListItems: items, uniqueLists: lists });
});

db().then(() => {
  app.listen(PORT, () => {
    console.log("Listening for requests");
  })
});


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