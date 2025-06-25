const express = require('express');
const port = 3000
const sequelize = require('./config/db.config')
const app = express()
const userModel = require('./models/users.models')

app.get("/helloworld", (req, res) => {
    res.send("Olá, mundo!")
})

// Rotas para autenticação
const authRoutes = require('./routes/auth.routes')
app.use("/auth/", authRoutes)

// Rotas de usuários
const usersRoutes = require('./routes/users.routes')
app.use("/users/", usersRoutes)

// Rota

app.listen(port, () => {
    console.log(`Servidor rodando em: http://localhost:${port}/`)
})
