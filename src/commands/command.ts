import type { CLICommand } from "../state.js";
import { commandCatch } from "./command_catch.js";
import { commandExit } from "./command_exit.js";
import { commandExplore } from "./command_explore.js";
import { commandHelp } from "./command_help.js";
import { commandInspect } from "./command_inspect.js";
import { commandMap } from "./command_map.js";
import { commandMapB } from "./command_mapb.js";

export function getCommands(): Record<string, CLICommand> {
  return {
    help: {
      name: "help",
      description: "Displays a help message",
      callback: commandHelp,
    },
    exit: {
      name: "exit",
      description: "Exit the Pokedex",
      callback: commandExit,
    },
    map: {
      name: "map",
      description: "Displays the names of the next 20 location areas in the Pokemon world. Every subsequent call will display the next 20.",
      callback: commandMap,
    },
    mapb: {
      name: "mapb",
      description: "Displays the names of the previous 20 location areas in the Pokemon world. Every subsequent call will display previous 20.",
      callback: commandMapB,
    },
    explore: {
      name: "explore <area_name>",
      description: "Explore a given area and display possible Pokemon encounters.",
      callback: commandExplore,
    },
    catch: {
      name: "catch <pokemon>",
      description: "Attempt to catch the named pokemon",
      callback: commandCatch,
    },
    inspect: {
      name: "inspect <pokemon>",
      description: "Inspect the details of a given pokemon in your pokedex",
      callback: commandInspect,
    }
  };
};