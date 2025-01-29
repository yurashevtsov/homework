"use strict";

class AppFeatures {
  constructor(databaseQuery, queryStr) {
    this.databaseQuery = databaseQuery;
    this.queryStr = queryStr;
  }

  //   could accept array/string of acceptable fields and filter by them, so this class could be used by other tables
  //   could accept array/string of acceptable fields and filter by them, so this class could be used by other tables
  sort() {
    if (this.queryStr?.order) {
      this.databaseQuery.order = this.queryStr.order.map((sortStr) =>
        sortStr.split("_")
      );
    }

    // explanation: we always get an array like ["userId_asc", "id", "color_desc"]
    // I want to check if the second part is indeed ASC or DESC - case insensitive. If its not asc/desc then only field will be taken and ordered in ascending order (just to prevent a throwing an error)
    // if (this.queryStr?.order) {
    //   this.databaseQuery.order = this.queryStr.order.map((sortString) => {
    //     const parts = sortString.split("_");
    //     if (parts.length > 1) {
    //       parts[1] = parts[1].toLowerCase();
    //       return parts[1] === "desc" || parts[1] === "asc"
    //         ? [parts[0], parts[1]]
    //         : parts[0];
    //     } else {
    //       return parts[0];
    //     }
    //   });
    // }

    return this;
  }

  //   could pass an argument to overwrite limit for findOne cases
  paginate() {
    this.databaseQuery.page = this.queryStr.page;
    this.databaseQuery.limit = this.queryStr.limit;
    this.databaseQuery.offset = (this.queryStr.page - 1) * this.queryStr.limit;

    return this;
  }

  // if I get unknown field, it will throw an error, what if I'll use filter to get only known fields before putting it there?
  limitFields() {
    if (this.queryStr?.fields) {
      this.databaseQuery.attributes = this.queryStr.fields;
    }
    return this;
  }
}

module.exports = AppFeatures;


// // ? Possible replacement for getAllSomething routes ?
// /**
//  *
//  * @param {object} filterObj object like { userId: 2, id:10 }
//  * @param {object} queryObj req.query object
//  * @param {object} Model sequelize (table) model
//  * @returns
//  */
// async function getAllEntities(filterObj, queryObj, Model) {
//   const filter = {
//     where: { ...filterObj },
//   };

//   const { databaseQuery } = new AppFeatures(filter, queryObj)
//     .sort()
//     .limitFields()
//     .paginate();

//   const allEntities = await Model.findAndCountAll(databaseQuery);

//   return {
//     total: allEntities.count,
//     totalPages: Math.ceil(allEntities.count / databaseQuery.limit),
//     currentPage: databaseQuery.page,
//     data: allEntities.rows,
//   };
// }

// async function getOneEntity(filterObj, queryObj, Model) {
//   const oneEntity = await Model.findOne({
//     where: { ...filterObj },
//   });

//   if (!oneEntity) {
//     throw new Error(`${Model.name} is not found.`);
//   }

//   return oneEntity;
// }

// async function updateOneEntity(filterObj, updateData, Model) {
//   const entityToUpdate = await Model.findOne({
//     where: { ...filterObj },
//   });

//   if (!entityToUpdate) {
//     throw new Error(`${Model.name} is not found.`);
//   }

//   entityToUpdate.set(updateData);
//   entityToUpdate.save();

//   return entityToUpdate;
// }

// async function deleteOneEntity(filterObj, Model) {
//   const entityToDelete = await Model.findOne({
//     where: { ...filterObj },
//   });

//   if (!entityToDelete) {
//     throw new Error(`${Model.name} is not found.`);
//   }

//   entityToDelete.destroy();

//   return null;
// }
