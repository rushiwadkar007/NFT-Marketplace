const router = require('express').Router();

const { register, login } = require("../controllers/auth");

const { verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifyToken');

const verifyTokenController = require("../controllers/user");
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
/**
 * @dev - Register API
 */
router.post("/register", urlencodedParser, register);
/**
 * @dev - Login API
 */
router.post("/login", urlencodedParser, login);
/**
 * @dev - Update Password API
 */
router.put("/:id", urlencodedParser, verifyTokenAndAuthorization, verifyTokenController);

module.exports = router;