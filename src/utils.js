'use strict';

module.exports.isWeekend = function isWeekend(date) {
    return date.isoWeekday() >= 6;
};