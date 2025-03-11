"use strict";

const {
  postCreateSchema,
  postUpdateSchema,
  validateIdSchema,
} = require("@src/resources/post/postValidationSchema");

describe("Post Validation Schemas", () => {
  describe("Validate ID Schema", () => {
    test("should validate a valid id", async () => {
      const result = await validateIdSchema.validateAsync({ id: 123 });
      expect(result).toEqual({ id: 123 });
    });

    test("should throw an error if id is missing", async () => {
      await expect(validateIdSchema.validateAsync({})).rejects.toThrowError(
        /"id" is required/
      );
    });

    test("should throw an error if id is not a number", async () => {
      await expect(
        validateIdSchema.validateAsync({ id: "notanumber" })
      ).rejects.toThrowError(/"id" must be a number/);
    });
  });

  describe("Post Create Schema", () => {
    const validPostData = {
      title: "sometitle",
      content: "somecontent",
      tags: "gw1, gw2",
    };

    test("should validate valid post request", async () => {
      const result = await postCreateSchema.validateAsync(validPostData);

      expect(result).toEqual({
        title: "sometitle",
        content: "somecontent",
        tags: ["gw1", "gw2"], // should convert string to an array of values correctly
      });
    });

    test("should remove dublicates from tags when provided", async () => {
      const result = await postCreateSchema.validateAsync({
        ...validPostData,
        tags: "gw1, gw2, gw2, gw2",
      });

      expect(result).toEqual({
        title: "sometitle",
        content: "somecontent",
        tags: ["gw1", "gw2"], // removed dublicates
      });
    });

    test("should throw an error on missing 'tags' field", async () => {
      await expect(
        postCreateSchema.validateAsync({
          title: "sometitle",
          content: "somecontent",
          // tags: "gw1, gw2"
        })
      ).rejects.toThrowError(/"tags" is required/);
    });

    test("should throw an error on missing 'content' field", async () => {
      await expect(
        postCreateSchema.validateAsync({
          title: "sometitle",
          // content: "somecontent",
          tags: ["gw1", "gw2"],
        })
      ).rejects.toThrowError(/"content" is required/);
    });

    test("should throw an error on missing 'title' field", async () => {
      await expect(
        postCreateSchema.validateAsync({
          // title: "sometitle",
          content: "somecontent",
          tags: ["gw1", "gw2"],
        })
      ).rejects.toThrowError(/"title" is required/);
    });
  });

  describe("Post Update Schema", () => {
    test("should validate when at least one field is provided", async () => {
      const validData = { title: "Updated Title" };
      await expect(postUpdateSchema.validateAsync(validData)).resolves.toEqual(
        validData
      );
    });

    test("should validate when content is provided", async () => {
      const validData = { content: "Updated Content" };
      await expect(postUpdateSchema.validateAsync(validData)).resolves.toEqual(
        validData
      );
    });

    test("should validate when tags are provided", async () => {
      const validData = { tags: "gw1, gw2" };
      const expectedResult = { tags: ["gw1", "gw2"] };
      await expect(postUpdateSchema.validateAsync(validData)).resolves.toEqual(
        expectedResult
      );
    });

    test("should validate when multiple fields are provided", async () => {
      const validData = {
        title: "Updated Title",
        content: "Updated Content",
        tags: "gw1, gw2",
      };

      const expectedResult = { ...validData, tags: ["gw1", "gw2"] };
      await expect(postUpdateSchema.validateAsync(validData)).resolves.toEqual(
        expectedResult
      );
    });

    test("should fail validation if no fields are provided", async () => {
      const invalidData = {};
      await expect(
        postUpdateSchema.validateAsync(invalidData)
      ).rejects.toThrow();
    });
  });
});
