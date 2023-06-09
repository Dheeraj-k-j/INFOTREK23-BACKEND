const express = require('express');
const router = express.Router();

const {signup, login} = require("../controllers/authController");

const {
    checkId,
    checkUserBody,
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  } = require("../controllers/userController");

// router.param('id', checkId); //Middleware to validate id it'll run whenerver there is a event url request with the id

router.post("/signup", signup);
router.post("/login", login);

router
    .route("/")
    .get(getAllUsers)
    .post(createUser);

router
    .route("/:id")
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;