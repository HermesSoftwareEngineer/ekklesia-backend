const express = require('express')
const router = express.Router()
const {usersList} = require('../controllers/users.controllers')

router.get("/", (req, res) => {
    res.send("Rota de usuários!")
})

router.get("/list", usersList)

module.exports = router;