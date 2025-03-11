const Joi = require("joi");

const {
  querySchema,
  validateIdSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
} = require("@src/resources/user/userValidationSchema");

describe("User Validation Schemas", () => {
  describe("Query Schema", () => {
    test("should validate a valid query", async () => {
      const result = await querySchema.validateAsync({
        order: "name_asc",
        page: 2,
        limit: 50,
        fields: "name,email",
      });
      expect(result).toEqual({
        order: "name_asc",
        page: 2,
        limit: 50,
        fields: "name,email",
      });
    });

    test("should set default values", async () => {
      const result = await querySchema.validateAsync({});
      expect(result).toEqual({
        order: undefined,
        page: 1,
        limit: 100,
        fields: undefined,
      });
    });

    test("should throw an error for invalid order", async () => {
      await expect(
        querySchema.validateAsync({ order: "invalid_order" })
      ).rejects.toThrowError(
        /order must be a string, sort direction should be specified after an underscore "id_desc"/
      );
    });
  });

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
  });

  describe("Login Schema", () => {
    test("should validate correct login credentials", async () => {
      const result = await loginSchema.validateAsync({
        email: "test@example.com",
        password: "securePassword123",
      });
      expect(result).toEqual({
        email: "test@example.com",
        password: "securePassword123",
      });
    });

    test("should throw an error for invalid password", async () => {
      await expect(
        loginSchema.validateAsync({
          email: "test@example.com",
          password: "invalid password!",
        })
      ).rejects.toThrowError(
        "Password contains forbidden characters or does not meet the length requirement"
      );
    });
  });

  describe("Create User Schema", () => {
    test("should validate a valid user creation request", async () => {
      const result = await createUserSchema.validateAsync({
        username: "validUsername",
        password: "secure123",
        repeatPassword: "secure123",
        email: "test@example.com",
      });
      expect(result).toEqual({
        username: "validUsername",
        password: "secure123",
        repeatPassword: "secure123",
        email: "test@example.com",
      });
    });

    test("should throw an error if passwords do not match", async () => {
      await expect(
        createUserSchema.validateAsync({
          username: "validUsername",
          password: "secure123",
          repeatPassword: "differentPassword",
          email: "test@example.com",
        })
      ).rejects.toThrowError("Passwords do not match");
    });
  });

  describe("Update User Schema", () => {
    test("should validate a valid user update request", async () => {
      const result = await updateUserSchema.validateAsync({
        username: "validUsername",
        password: "secure123",
        repeatPassword: "secure123",
        avatar: "avatar.png",
      });
      expect(result).toEqual({
        username: "validUsername",
        password: "secure123",
        repeatPassword: "secure123",
        avatar: "avatar.png",
      });
    });

    test("should allow missing username for update", async () => {
      const result = await updateUserSchema.validateAsync({
        password: "secure123",
        repeatPassword: "secure123",
      });
      expect(result).toEqual({
        password: "secure123",
        repeatPassword: "secure123",
      });
    });
    test("should allow missing password (repeatPassword shouldnt be specified) for update", async () => {
      const result = await updateUserSchema.validateAsync({
        username: "validUsername",
      });
      expect(result).toEqual({
        username: "validUsername",
      });
    });

    test("should throw error if passwords dont match", async () => {
      await expect(
        updateUserSchema.validateAsync({
          password: "pass123",
          repeatPassword: "pass321",
        })
      ).rejects.toThrowError("Passwords do not match");
    });

    test("should throw error if passwordRepeat is missing", async () => {
      await expect(
        updateUserSchema.validateAsync({
          password: "pass123",
        })
      ).rejects.toThrowError(
        `"password" missing required peer "repeatPassword"`
      );
    });
  });
});
