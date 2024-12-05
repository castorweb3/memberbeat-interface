// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

const mongoose = require("mongoose");

const periodEnum = ['Day', 'Month', 'Year', 'Lifetime'];
const pricingTypeEnum = ['TokenPrice', 'FiatPrice'];

const billingPlanSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: periodEnum,
    required: true
  },
  periodValue: {
    type: Number,
    required: false
  },
  pricingType: {
    type: String,
    enum: pricingTypeEnum,
    required: true
  },
  tokens: [{
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true
    },
    tokenPrice: {
      type: Number,
      required: false
    }
  }],
  fiatPrice: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

module.exports = {
  periodEnum,
  pricingTypeEnum,
  billingPlanSchema,
}

exports.periodEnum = periodEnum;
exports.pricingTypeEnum = pricingTypeEnum;
exports.billingPlanSchema = billingPlanSchema;