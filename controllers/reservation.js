const { devError } = require("../Helpers/devError");
const generateMessage = require("../Helpers/generateMessage");
const { Property } = require("../models/property");
const moment = require("moment");
const Reservation = require("../models/reservation");
const vnDateRegex = require("../Helpers/convertVietnameseStr");

const createReservation = async (req, res) => {
  const { propertyId, startDate, endDate } = req.body;
  try {
    if (!propertyId) return generateMessage("Property id is required", res);
    if (!startDate) return generateMessage("Start date is requried", res);
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
      });
    if (!foundedProperty)
      return generateMessage("Cannot find this property.", res);
    const dateRegex = vnDateRegex();
    if (
      (startDate || endDate) &&
      (!dateRegex.test(startDate) || !dateRegex.test(endDate))
    )
      return generateMessage(
        "Invalid date format. Only dd/MM/yyyy formats are accepted",
        res
      );
    const isDateBetween = (date, startDate, endDate) =>
      moment(date, "DD-MM-YYYY").isBetween(
        moment(startDate, "DD-MM-YYYY"),
        moment(endDate, "DD-MM-YYYY"),
        undefined,
        "[]"
      );
    const unmatchedProperties = null;
    for (const item of foundedProperty.listOfReservation) {
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
        isDateBetween(item.startDate, fromDate, toDate) ||
        (moment(item.startDate, "DD-MM-YYYY").isBefore(fromDate) &&
          (isDateBetween(item.endDate, fromDate, toDate) || !item.endDate));
      if (inavailFromDate || inavailToDate || overBookedDays) {
        unmatchedProperties = item;
        break;
      }
    }
    if (unmatchedProperties)
      return generateMessage(
        "This date has already been booked, please select another date.",
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
      .populate("booker", "username email phone name avatar")
      .populate({
        path: "property",
        select: "owner",
        populate: { path: "owner", select: "username" },
      });
    if (!result) return generateMessage("This reservation does not exist", res);
    if (
      result.booker.username !== req.user.username &&
      result.property.owner.username !== req.user.username
    )
      return generateMessage("You are not authorized", res);
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const updateReservation = async (req, res) => {
  const { reservationId, startDate, endDate, isActive } = req.body;
  try {
    if (!reservationId)
      return generateMessage("Reservation Id is required", res);
    const dateRegex = vnDateRegex();
    if (
      (startDate || endDate) &&
      (!dateRegex.test(startDate) || !dateRegex.test(endDate))
    )
      return generateMessage(
        "Invalid date format. Only dd/MM/yyyy formats are accepted",
        res
      );

    const foundedReservation = await Reservation.findOne({ _id: reservationId })
      .populate("booker", "username")
      .populate({
        path: "property",
        select: "owner listOfReservation",
        populate: {
          path: "owner listOfReservation",
          match: { isActive: true },
          select: "username startDate endDate",
        },
      });
    if (!foundedReservation)
      return generateMessage("This reservation does not exist", res);

    if (
      req.user.username !== foundedReservation.booker.username &&
      req.user.username !== foundedReservation.property.owner.username
    )
      return generateMessage("You are not authorized", res);

    const isDateBetween = (date, startDate, endDate) =>
      moment(date, "DD-MM-YYYY").isBetween(
        moment(startDate, "DD-MM-YYYY"),
        moment(endDate, "DD-MM-YYYY"),
        undefined,
        "[]"
      );
    const unmatchedProperties = null;
    for (const item of foundedReservation.property.listOfReservation) {
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
        isDateBetween(item.startDate, fromDate, toDate) ||
        (moment(item.startDate, "DD-MM-YYYY").isBefore(fromDate) &&
          (isDateBetween(item.endDate, fromDate, toDate) || !item.endDate));
      if (inavailFromDate || inavailToDate || overBookedDays) {
        unmatchedProperties = item;
        break;
      }
    }
    if (unmatchedProperties)
      return generateMessage(
        "This date has already been booked, please select another date.",
        res
      );

    foundedReservation.startDate = startDate || foundedReservation.startDate;
    foundedReservation.endDate = endDate || foundedReservation.endDate;
    foundedReservation.isActive = isActive || foundedReservation.isActive;
    const result = await foundedReservation.save();
    res.send(result);
  } catch (error) {
    devError(error, res);
  }
};

const declineReservationRequest = async (req, res) => {
  const { reservationId } = req.body;
  try {
    if (!reservationId)
      return generateMessage("Reservation Id is required", res);
    const result = Reservation.findOne({ _id: reservationId, isActive: true })
      .populate("booker", "username email phone name avatar")
      .populate({
        path: "property",
        select: "owner",
        populate: { path: "owner", select: "username" },
      });
    if (!result)
      return generateMessage(
        "This reservation does not exist or already declined",
        res
      );
    if (
      result.property.owner.username !== req.user &&
      req.user.role !== "Admin"
    )
      return generateMessage("You are not authorized", res);
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
