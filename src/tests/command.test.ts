import { describe, expect, test } from "vitest";
import { getCommands } from "../commands/command.js";

describe("getCommands", () => {
  const commands = getCommands();

  test("registers the expected commands", () => {
    expect(Object.keys(commands).sort()).toEqual([
      "exit",
      "help",
      "map",
      "mapb",
    ]);
  });

  test.each(Object.entries(commands))(
    "%s has a name, description and callback",
    (key, cmd) => {
      expect(cmd.name).toBe(key);
      expect(cmd.description.length).toBeGreaterThan(0);
      expect(typeof cmd.callback).toBe("function");
    },
  );
});
