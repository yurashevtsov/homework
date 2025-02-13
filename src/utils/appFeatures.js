"use strict";

class AppFeatures {
  constructor(databaseQuery, queryParams) {
    this.databaseQuery = databaseQuery;
    this.queryParams = queryParams;

    this.sort();
    this.paginate();
    this.limitFields();
  }

  //   could accept array/string of acceptable fields and filter by them, so this class could be used by other tables
  //   could accept array/string of acceptable fields and filter by them, so this class could be used by other tables
  sort() {
    if (this.queryParams?.order) {
      this.databaseQuery.order = this.queryParams.order.map((sortStr) =>
        sortStr.split("_")
      );
    }

    return this;
  }

  //   could pass an argument to overwrite limit for findOne cases
  paginate() {
    this.databaseQuery.page = this.queryParams.page;
    this.databaseQuery.limit = this.queryParams.limit;
    this.databaseQuery.offset =
      (this.queryParams.page - 1) * this.queryParams.limit;

    return this;
  }

  // if I get unknown field, it will throw an error, what if I'll use filter to get only known fields before putting it there?
  limitFields() {
    if (this.queryParams?.fields) {
      this.databaseQuery.attributes = this.queryParams.fields;
    }
    return this;
  }
}

module.exports = AppFeatures;
