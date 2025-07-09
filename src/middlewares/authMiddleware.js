const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ aviso: "Token não fornecido!" });
        }
        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                return res.status(401).json({ aviso: "Token inválido!" });
            }
            req.user = user;
            req.tipoUsuario = user?.tipoUsuario; // Adiciona tipoUsuario diretamente ao req
            next();
        });
    } catch (error) {
        return res.status(500).json({ aviso: "Erro na autenticação!" });
    }
}

// Função para autenticar e autorizar por tipo de usuário
const authorizeUserType = (requiredType) => {
    return (req, res, next) => {
        authenticateToken(req, res, () => {
            const userType = req.user?.tipoUsuario;
            if (!userType) {
                return res.status(403).json({ aviso: "Tipo de usuário não encontrado no token!" });
            }
            if (Array.isArray(requiredType)) {
                if (!requiredType.includes(userType)) {
                    return res.status(403).json({ aviso: "Permissão negada!" });
                }
            } else {
                if (userType !== requiredType) {
                    return res.status(403).json({ aviso: "Permissão negada!" });
                }
            }
            next();
        });
    };
};

module.exports = { authenticateToken, authorizeUserType }