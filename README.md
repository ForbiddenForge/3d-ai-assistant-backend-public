The frontend is [here](https://github.com/ForbiddenForge/3d-ai-assistant-frontend).

## Setup

Create a `.env` file at the root of the repository to add your **OpenAI** and **ElevenLabs API Keys**. Refer to `.env.example` for the environment variable names.

Update the names of your environment variables in src/config/config.js

This backend is designed to be modular and handle multiple frontends. Prompts can be updated/added/removed inside of src/config/prompts.js

Relevant binaries are located in the bin folder. Code is written for a Linux environment. Update the relevant paths and binaries based on your OS. Refer to comments in scripts/make_rhubarb_ffmpeg_executable.sh. 

Start the development server with

### NPM

```
npm install
npm run dev
```

OR

### Yarn

```
yarn
yarn dev
```
