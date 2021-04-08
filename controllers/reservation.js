const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const moment = require("moment");
const Reservation = require("../models/reservation");
const { vnDateRegex } = require("../Helpers/convertVietnameseStr");
const User = require("../models/user");

//---------------------------------------------------------------

const createReservation = async (req, res) => {
  const { propertyId, startDate, endDate } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    if (!startDate) return generateMessage("Start date is requried", res);
    if (!endDate) return generateMessage("End date is requried", res);
    const foundedProperty = await Property.findOne({
      _id: propertyId,
      isActive: true,
      isPublished: true,
    })
      .select("listOfReservation serviceFee pricePerDay owner")
      .populate({
        path: "listOfReservation",
        match: { isActive: true },
        select: "startDate endDate",
      })
      .populate({
        path: "owner",
        select: "username -_id",
      });

    if (!foundedProperty)
      return generateMessage("Cannot find this property.", res, 404);
    if (foundedProperty.owner.username === req.user.username)
      return generateMessage("You cannot book your own property.", res, 406);
    const dateRegex = vnDateRegex();
    if (
      (startDate && !dateRegex.test(startDate)) ||
      (endDate && !dateRegex.test(endDate))
    )
      return generateMessage(
        "Invalid date format. Only dd/MM/yyyy formats are accepted",
        res,
        406
      );
    if (
      startDate &&
      endDate &&
      moment(startDate, "DD-MM-YYYY").isAfter(moment(endDate, "DD-MM-YYYY"))
    )
      return generateMessage("'startDate' cannot be later than 'endDate'", res);
    const isDateBetween = (a, b, c) =>
      moment(a, "DD-MM-YYYY").isBetween(
        moment(b, "DD-MM-YYYY"),
        c ? moment(c, "DD-MM-YYYY") : moment().add(1825, "days"),
        null,
        "[]"
      );
    let unmatchedProperties = null;
    for (const item of [...foundedProperty.listOfReservation]) {
      const inavailFromDate = isDateBetween(
        startDate,
        item.startDate,
        item.endDate
      );
      const inavailToDate = isDateBetween(
        endDate,
        item.startDate,
        item.endDate
      );
      const overBookedDays =
        isDateBetween(item.startDate, startDate, endDate) ||
        (moment(item.startDate, "DD-MM-YYYY").isBefore(
          moment(startDate, "DD-MM-YYYY")
        ) &&
          (isDateBetween(item.endDate, startDate, endDate) || !item.endDate));
      if (inavailFromDate || inavailToDate || overBookedDays) {
        unmatchedProperties = item;
        break;
      }
    }
    if (unmatchedProperties)
      return generateMessage(
        "The dates you choose have already been booked, please select another date.",
        res
      );
    const totalPrice = endDate
      ? foundedProperty.serviceFee +
        foundedProperty.pricePerDay *
          moment(endDate, "DD-MM-YYYY").diff(
            moment(startDate, "DD-MM-YYYY"),
            "days"
          )
      : null;
    const newReservation = new Reservation({
      booker: req.user._id,
      property: propertyId,
      startDate,
      endDate,
      totalPrice,
    });
    const result = await newReservation.save();
    req.user.bookedList.push(result._id);
    await req.user.save();
    foundedProperty.listOfReservation.push(result._id);
    await foundedProperty.save();
    const foundedUser = await User.findOne({
      username: foundedProperty.owner.username,
    }).select("group manageReservations");
    foundedUser.manageReservations.push(result._id);
    await foundedUser.save();
    await result.populate("booker", "username name email -_id").execPopulate();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const reservationDetails = async (req, res) => {
  const { reservationId } = req.query;
  try {
    if (!reservationId)
      return generateMessage("Reservation Id is required", res);
    const result = await Reservation.findOne({ _id: reservationId })
      .populate("booker", "username email phone name avatar -_id")
      .populate({
        path: "property",
        select: "owner",
        populate: { path: "owner", select: "username name avatar -_id" },
      });
    if (!result)
      return generateMessage("This reservation does not exist", res, 404);
    if (
      result.booker.username !== req.user.username &&
      result.property.owner.username !== req.user.username
    )
      return generateMessage("You are not authorized", res, 401);
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updateReservation = async (req, res) => {
  const { reservationId, startDate, endDate } = req.body;
  try {
    if (!reservationId)
      return generateMessage("Reservation Id is required", res);
    const dateRegex = vnDateRegex();
    if (
      (startDate && !dateRegex.test(startDate)) ||
      (endDate && !dateRegex.test(endDate))
    )
      return generateMessage(
        "Invalid date format. Only dd/MM/yyyy formats are accepted",
        res,
        406
      );
    if (
      startDate &&
      endDate &&
      moment(startDate, "DD-MM-YYYY").isAfter(moment(endDate, "DD-MM-YYYY"))
    )
      return generateMessage("'startDate' cannot be later than 'endDate'", res);
    const foundedReservation = await Reservation.findOne({
      _id: reservationId,
      isActive: true,
    })
      .populate("booker", "username -_id")
      .populate({
        path: "property",
        select: "owner listOfReservation serviceFee pricePerDay",
        populate: {
          path: "owner listOfReservation",
          select: "username startDate endDate",
        },
      });
    if (!foundedReservation)
      return generateMessage("This reservation does not exist", res, 404);

    if (
      req.user.username !== foundedReservation.booker.username &&
      req.user.username !== foundedReservation.property.owner.username
    )
      return generateMessage("You are not authorized", res, 401);

    const isDateBetween = (date, startDate, endDate) =>
      moment(date, "DD-MM-YYYY").isBetween(
        moment(startDate, "DD-MM-YYYY"),
        endDate ? moment(endDate, "DD-MM-YYYY") : moment().add(1825, "days"),
        undefined,
        "[]"
      );
    let unmatchedProperties = null;
    const filteredList = foundedReservation.property.listOfReservation.filter(
      (item) => item._id.toString() !== reservationId
    );
    for (const item of filteredList) {
      const inavailFromDate = isDateBetween(
        startDate || foundedReservation.startDate,
        item.startDate,
        item.endDate
      );
      const inavailToDate = isDateBetween(
        endDate || foundedReservation.endDate,
        item.startDate,
        item.endDate
      );
      const overBookedDays =
        isDateBetween(
          item.startDate,
          startDate || foundedReservation.startDate,
          endDate || foundedReservation.endDate
        ) ||
        (moment(item.startDate, "DD-MM-YYYY").isBefore(
          moment(startDate || foundedReservation.startDate, "DD-MM-YYYY")
        ) &&
          (isDateBetween(
            item.endDate,
            startDate || foundedReservation.startDate,
            endDate || foundedReservation.endDate
          ) ||
            !item.endDate));
      if (inavailFromDate || inavailToDate || overBookedDays) {
        unmatchedProperties = item;
        break;
      }
    }
    if (unmatchedProperties)
      return generateMessage(
        "The dates you choose have already been booked, please select another date.",
        res
      );

    if (
      startDate &&
      moment(startDate, "DD-MM-YYYY").isAfter(
        moment(foundedReservation.endDate, "DD-MM-YYYY")
      )
    )
      return generateMessage("'startDate' cannot be later than 'endDate'", res);
    if (
      endDate &&
      moment(endDate, "DD-MM-YYYY").isBefore(
        moment(foundedReservation.startDate, "DD-MM-YYYY")
      )
    )
      return generateMessage(
        "'endDate' cannot be sooner than 'startDate'",
        res
      );
    foundedReservation.startDate = startDate || foundedReservation.startDate;
    foundedReservation.endDate = endDate || foundedReservation.endDate;
    foundedReservation.totalPrice =
      foundedReservation.property.serviceFee +
      foundedReservation.property.pricePerDay *
        moment(foundedReservation.endDate, "DD-MM-YYYY").diff(
          moment(foundedReservation.startDate, "DD-MM-YYYY"),
          "days"
        );

    const result = await foundedReservation.save();
    res.send({ ...result.toObject(), property: result.property._id });
  } catch (error) {
    devError(error, res);
  }
};

const declineReservationRequest = async (req, res) => {
  const { reservationId } = req.query;
  try {
    if (!reservationId)
      return generateMessage("Reservation Id is required", res);
    const result = await Reservation.findOne({
      _id: reservationId,
      isActive: true,
    })
      .populate("booker", "username email phone name avatar")
      .populate({
        path: "property",
        select: "owner",
        populate: { path: "owner", select: "username" },
      });
    if (!result)
      return generateMessage(
        "This reservation does not exist or already declined",
        res,
        404
      );
    if (
      result.property.owner.username !== req.user &&
      req.user.role !== "Admin"
    )
      return generateMessage("You are not authorized", res, 401);
    result.isActive = false;
    await result.save();
    res.send({ message: "Declined successfully." });
  } catch (error) {
    devError(error, res);
  }
};

module.exports = {
  createReservation,
  reservationDetails,
  updateReservation,
  declineReservationRequest,
};
