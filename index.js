const express = require("express");
const recipes = require("./data/MOCK_DATA.json")
const cors = require('cors')

const app = express()
app.use(cors())

const port = 8080;



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
    console.log(id)
    const recipe = recipes.find(recipe=>recipe.id == id);
    console.log(recipe)
    res.json(recipe)
})


app.listen(port, ()=>{
    console.log("app listening at port "+port )
})