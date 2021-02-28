[![Build Status](https://travis-ci.com/rolznz/infinitris2.svg?branch=master)](https://travis-ci.com/rolznz/infinitris2)&nbsp;
[![codecov](https://codecov.io/gh/rolznz/infinitris2/branch/master/graph/badge.svg)](https://codecov.io/gh/rolznz/infinitris2)&nbsp;

# Infinitris 2

Infinitris 2 is a massively multiplayer falling block puzzle game. Place blocks on a giant grid that expands and contracts based on the number of players in-game. Gain score by stealing cells and helping to clear lines in an unending power struggle.

Infinitris 2 attempts to deal with many issues raised in [Infinitris.io](https://github.com/rolznz/infinitris2/wiki/infinitris.io) by providing simpler and more intuitive mechanics and a power balance which rewards skilled players.

More information can be found in our [Wiki](https://github.com/rolznz/infinitris2/wiki/Home).

# Installation

Infinitris is currently in design phase. A minimal prototype to test our ideas will hopefully be coming soon.

Please see the [Server Readme](server/README.md) and the [Client Readme](client/README.md)

# Documentation

- [Server Documentation](https://rolznz.github.io/infinitris2-server-docs)
- [Client Documentation](https://rolznz.github.io/infinitris2-client-docs)

# Project structure

## models

Shared model declarations required by the core project and React app

## core

Core logic shared between client and server

## server

Hosts rooms that clients can join

## client

Frontend for single player and multiplayer games

## app

Frontend UI for access to the lobby, managing user settings, challenges etc
