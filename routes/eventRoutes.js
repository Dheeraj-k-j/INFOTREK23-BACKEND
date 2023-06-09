const express = require('express');
const router = express.Router();

const {
    checkId,
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  } = require("../controllers/eventController");

// router.param('id', checkId); //Middleware to validate id it'll run whenerver there is a event url request with the id
router
    .route("/")
    .get(getAllEvents)
    .post(createEvent);

router
    .route("/:id")
    .get(getEvent)
    .patch(updateEvent)
    .delete(deleteEvent);

module.exports = router;