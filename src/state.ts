import { stdin, stdout } from 'node:process';
import { createInterface, type Interface } from "readline";
import { getCommands } from './commands/command.js';
import { PokeAPI, type Pokemon } from './pokeapi.js';

export type State = {
  readline: Interface;
  commands: Record<string, CLICommand>;
  pokeAPI: PokeAPI;
  pokeDex: Record<string, Pokemon>
  nextLocationsURL?: string;
  prevLocationsURL?: string;
}

export type CLICommand = {
  name: string;
  description: string;
  callback: (state: State, ...args: string[]) => Promise<void>;
};

export function initState(): State {
  const pokeAPI = new PokeAPI();
  const readline = createInterface({
      input: stdin,
      output: stdout,
      prompt: "Pokedex > "
    });

  return {
    readline,
    commands: getCommands(),
    pokeAPI,
    pokeDex: {},
    nextLocationsURL: undefined,
    prevLocationsURL: undefined
  }
}