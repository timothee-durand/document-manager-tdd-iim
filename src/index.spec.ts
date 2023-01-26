import { helloWorld } from "./index";

describe("hello world", () => {
  test("should return `hello world`", () => {
    const result = helloWorld();

    expect(result).toBe("hello world");
  });
});
