import type { CLICommand } from "../state.js";
import { commandExit } from "./command_exit.js";
import { commandHelp } from "./command_help.js";
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
    }
  };
};