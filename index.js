const express = require("express");
const cors = require('cors')
const {MongoClient, ObjectId} = require("mongodb")
const bcrypt = require("bcrypt")
const multer = require("multer")
const path = require('path')
require('dotenv').config(); 



const app = express()
const port = 8080;
const url = process.env.MONGO_URL;
const client = new MongoClient(url)
const databaseName = process.env.MONGO_DB;
const refreshInterval = 2 * 60 * 1000



let recipes = []
let users = []

app.use(cors())
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function fetchData() {
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db(databaseName); 
        const recipeCollection = database.collection("Recipes"); 
        recipes = await recipeCollection.find().toArray(); 

        const usersCollection = database.collection('Users'); 
        users = await usersCollection.find().toArray();

        

        


    } catch (error) {
        console.error('Error fetching recipes:', error);
    } 
}
fetchData()
setInterval(fetchData,refreshInterval)



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Set the folder for uploaded images
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() +path.extname(file.originalname)); // Use timestamp as filename
    }
  });
  
  const upload = multer({ storage: storage }).single('image'); // Handle single file uploads under the 'image' field
  
  



app.get('/api/v1/allRecipes',(req,res)=>{
    
    res.json(recipes)

})


app.get('/api/v1/breakfast',(req,res)=>{
    
    const filteredData = recipes.filter((recipe)=>recipe.mealType.includes('Breakfast'))
    res.json(filteredData)
})


app.get('/api/v1/lunch',(req,res)=>{
    
    const filteredData = recipes.filter((recipe)=>recipe.mealType.includes('Lunch'))
    res.json(filteredData)
})


app.get('/api/v1/dinner',(req,res)=>{
    
    const filteredData = recipes.filter((recipe)=>recipe.mealType.includes('Dinner'))
    res.json(filteredData)
})

app.get('/api/v1/recipe/:id',(req,res)=>{
    
    const id = req.params.id;
    const recipe = recipes.find(recipe=>recipe._id == id);
    res.json(recipe)
})


app.get("/api/v1/top",(req,res)=>{
    
    const sortedRecipes = recipes.sort((a,b)=>{
        return b.rating-a.rating
    })
    const top4 = sortedRecipes.slice(0,4)
    res.json(top4)

})


app.get('/api/v1/latest',(req,res)=>{
    
    const sortedRecipes = recipes.sort((a,b)=>{
        return (new Date(a.date) - new Date(b.date));
    })

    const latest = sortedRecipes.slice(0,4)
    res.json(latest)
})

app.get('/api/v1/search/:searchTerm',(req,res)=>{
    
    let {searchTerm} = req.params

    const filteredDta = recipes.filter((recipe)=>{
        return recipe.title.toLowerCase().includes(searchTerm) || recipe.cuisine.toLowerCase().includes(searchTerm) || recipe.ingredients.join(' ').toLowerCase().includes(searchTerm) || recipe.instructions.join(' ').toLowerCase().includes(searchTerm)
    
    })

    res.json(filteredDta)
})



app.get('/api/v1/usersFavs/:user',(req,res)=>{
    
    let {user} = req.params;
    let reqUser = users.filter(u=>u.username===user)[0]
    console.log(reqUser.favorites)
    const favoriteRecipeIds = reqUser.favorites;
    const favoriteRecipes = recipes.filter(recipe => 
        favoriteRecipeIds.includes(recipe._id)
    );
    res.json(favoriteRecipes)
})


app.post('/api/v1/signup', async (req,res)  =>{
    console.log(req.body)
    const user = req.body
    const {email,fullname,password} = user;
    console.log(password)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    
        await client.connect()
        const db = client.db(databaseName);
        const collection = db.collection('Users');
        const userPresent = await collection.findOne({ email: email });
        if (userPresent){
            res.json({'user':"User Already exist"})
        }else{

            
            const userToInsert = {...user, password:hashedPassword}
            
            try{
            await collection.insertOne(userToInsert)
            res.json({'user':"User Added"})
        } catch (err){
            res.json({'user':err})
        }
        
    }

})



app.post('/api/v1/login', async (req, res) => {
    const { email, password } = req.body; // User's email and password
    
  
    try {
      // Connect to the database
      await client.connect();
      const db = client.db(databaseName);
      const collection = db.collection('Users');
  
      // Find the user by email
      const user = await collection.findOne({ email });
  
      if (!user) {
        return res.json({ message: 'User not found' });
      }
  
      // Compare the entered password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);
  
      if (match) {
        // Passwords match
        res.json({ message: 'Login successful', user: user });
      } else {
        // Passwords do not match
        res.json({ message: 'Invalid password' });
      }
    } catch (error) {
      console.error(error);
      res.json({ message: 'Internal server error' });
    } finally {
      await client.close();
    }
  });


app.post("/api/v1/uploadRecipe", upload, async (req, res) => {
    
    // Destructure form data from req.body
    const { recipeName, servings, prepTime, cookTime, cuisine, calories, ingredients, instructions } = req.body;
  
    // Handle the uploaded image file if present
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
    // Convert ingredients from a string to an array (if needed)
    const ingredientsArray = ingredients ? ingredients.split(",") : [];
    const instructionsArray = instructions ? instructions.split(",") : [];
  
    // Create a recipe object to save to MongoDB
    const newRecipe = {
      'title':recipeName,
      'servings':servings,
      'prepTime':prepTime,
      'cookTime':cookTime,
      'cuisine':cuisine,
      'calories':calories,
      'ingredients': ingredientsArray,
      'instructions':instructionsArray,
      'image': imageUrl,
      'date': Date.now(),
      'comments':[]
    };
  
    try {
      // Insert the new recipe into the MongoDB collection
      await client.connect();
      const db = client.db(databaseName);
      const recipeCollection = db.collection("Recipes");
      await recipeCollection.insertOne(newRecipe);
  
      // Return a success response with the uploaded recipe data
      fetchData()
      res.json({ message: "Recipe uploaded successfully", recipe: newRecipe });
    } catch (error) {
      // If something goes wrong, send an error response
      console.error(error);
      res.status(500).json({ message: "Error uploading recipe", error });
    }
  });


app.get('/api/v1/:userId/recipes',(req,res)=>{
    
    let {userId} = req.params;
    console.log(userId)
    const filteredData = recipes.filter((recipe)=>{
        return recipe.userId == userId
    })
    console.log(filteredData)
    res.json(filteredData)

})

app.post('/api/v1/comment', async (req,res)=>{
    let {id, username , comment, rating} = req.body;
    console.log(req.body)
    try {
        await client.connect();
        const db = client.db(databaseName);
        const recipeCollection = db.collection('Recipes'); // Replace 'Recipes' with your collection name
    
        const updateResult = await recipeCollection.updateOne(
          { _id: new ObjectId(id) }, // Find the recipe by its unique ID
          { $push: { comments: {
            'user':username,
            'comment':comment,
            'date':new Date().toISOString().split('T')[0],
            'rating':rating
          } } } // Push the comment into the `comments` array
        );
        console.log('Comment added:', updateResult);
        fetchData()
        res.json({"message":"Commented Successfully"})
    } catch (error) {
        console.error('Error adding comment:', error);
        res.json({"message":"Error Adding comment"})
      } finally {
        await client.close();
      }
    }




)
  

app.listen(port, ()=>{
    console.log("app listening at port "+port )
})