const express = require("express");
const cors = require('cors')
const {MongoClient} = require("mongodb")
require('dotenv').config(); 

const app = express()
const port = 8080;
const url = process.env.MONGO_URL;
const client = new MongoClient(url)
const databaseName = process.env.MONGO_DB;
console.log(url,databaseName);



let recipes = []
let users = []

app.use(cors())
app.use(express.json());


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
    } finally {
        await client.close();  // Always close the connection when done
    }
}

fetchData()




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
    const recipe = recipes.find(recipe=>recipe.id == id);
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




app.post('/api/v1/login',(req,res)=>{
    console.log(req.body)
    const {email} = req.body;
    console.log(email)

    const present = users.find((user)=>user.email==email)

    if (present){
        res.json(present)
    } else{
        res.json({user:"No user found"})
    }
})


app.listen(port, ()=>{
    console.log("app listening at port "+port )
})
