const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const authenticate = jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                res.status(401).json({aviso: "Token inválido!"});
                return;
            } else {
                req.user = user;
                next()
            }
        });
    } catch (error) {

    }
}

module.exports = { authenticateToken }