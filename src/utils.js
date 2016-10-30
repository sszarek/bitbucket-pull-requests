'use strict';

const moment = require('moment');
const HOUR_FORMAT = 'HH:mm';

module.exports.isWeekend = function isWeekend(date) {
    return date.isoWeekday() >= 6;
};

module.exports.isBetweenHours = function isBetweenHours(date, from, to) {
    return date.isBetween(moment(from, HOUR_FORMAT), moment(to, HOUR_FORMAT));
}
