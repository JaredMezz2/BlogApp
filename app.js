var bodyParser 		= require("body-parser"),
	methodOverride 	= require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	mongoose 		= require("mongoose"),
	express 		= require("express"),
	app 			= express();

// clear depreciation warnings and connect to db
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/blog_app");

// set default file to .ejs
app.set("view engine", "ejs");
// deliver public folder to viewers
app.use(express.static("public"));
// setup bodyParser for forms
app.use(bodyParser.urlencoded({extended: true}));
// setup express sanitizer -- HAS TO BE AFTER BODYPARSER
app.use(expressSanitizer());
// setup method-override for requests
app.use(methodOverride("_method"));

// MONGOOSE / MODEL CONFIG
// blog post should have Title, Image, Body, and Date Created
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);
	
// RESTFUL ROUTES
// Default route directs to index page
app.get("/", function(req, res){
	res.redirect("/blogs");
})

// INDEX ROUTE -- serve all blogs when directed here
app.get("/blogs", function(req, res){
	// retrieve all blogs from db , if success pass to index as blogs
	Blog.find({}, function(err, blogs){
		if (err){
			console.log("Error getting all blogs");
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	})
})

// NEW ROUTE -- show new blog form
app.get("/blogs/new", function(req, res){
	res.render("new");
})

// CREATE ROUTE -- add new blog to db and redirect
app.post("/blogs", function(req, res){
	// get body field from form submitted in request
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// create blog
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			// redirect to index
			res.redirect("/blogs");
		}
	})
})

// SHOW ROUTE -- show information about one blog
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	})
})

// EDIT ROUTE -- redirect user to edit form, pass through blog information
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs")
		} else {
			res.render("edit", {blog: foundBlog});
		}
	})
})

// UPDATE ROUTE -- get data from form filled in and findbyId and Update new data, redirect to show page
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs")
		} else {
			res.redirect("/blogs/" + req.params.id)
		}
	})
})

// DELETE ROUTE -- remove blog post from db based on in passed in
app.delete("/blogs/:id", function(req, res){
	// find blog post by id passed in url
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			// error check, if cant find blog post redirect to index
			res.redirect("/blogs");
		} else {
			// redirect to index
			res.redirect("/blogs");
		}
	})
})

// listen on port 3000 for db
app.listen(3000, function(){
	console.log("Server Started");
})
