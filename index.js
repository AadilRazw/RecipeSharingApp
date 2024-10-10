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

app.listen(port, ()=>{
    console.log("app listening at port "+port )
})