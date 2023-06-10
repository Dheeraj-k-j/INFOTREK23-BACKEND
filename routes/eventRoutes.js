const express = require('express');
const router = express.Router();

const {
    checkId,
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    checkEventBody,
  } = require("../controllers/eventController");

const {
    protect,
    restrictTo
  } = require('../controllers/authController');

// router.param('id', checkId); //Middleware to validate id it'll run whenerver there is a event url request with the id

router
    .route("/")
    .get(getAllEvents)
    .post(protect, restrictTo("admin", "member"), checkEventBody, createEvent);

router
    .route("/:id")
    .get(getEvent)
    .patch(protect, restrictTo("admin", "member"), updateEvent)
    .delete(protect, restrictTo("admin", "member"), deleteEvent);

module.exports = router;