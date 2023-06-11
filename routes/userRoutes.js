const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword
} = require("../controllers/authController");

const {
    checkId,
    checkUserBody,
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  } = require("../controllers/userController");

// router.param('id', checkId); //Middleware to validate id it'll run whenerver there is a event url request with the id

router.post("/signup", checkUserBody, signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword/", protect, updatePassword);
// router.post("/resetPassword", resetPassword);

router
    .route("/")
    .get(protect, getAllUsers)
    .post(protect, createUser);

router
    .route("/:id")
    .get(protect, getUser)
    .patch(protect, updateUser)
    .delete(protect, deleteUser);

module.exports = router;