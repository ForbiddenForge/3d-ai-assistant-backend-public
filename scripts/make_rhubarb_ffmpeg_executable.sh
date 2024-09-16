#!/bin/bash
# NOTE: DO NOT RUN THIS SCRIPT if the binaries are already executable and functioning.
# This script has been prerun before committing to the repository. 

# ONLY run this script if you need to replace the binaries included in this repository with updated versions or if for whatever reason they don't work as expected. In this instance include the following script in your build or start commands for whatever backend you are using: "chmod +x ./scripts/make_rhubarb_ffmpeg_executable.sh && ./scripts/make_rhubarb_ffmpeg_executable.sh"

# Make FFmpeg and Rhubarb executable

# Get the directory of the script
SCRIPT_DIR=$(dirname "$0")

# Construct the paths to the binaries
FFMPEG_PATH="$SCRIPT_DIR/../bin/ffmpeg/ffmpeg"
RHUBARB_PATH="$SCRIPT_DIR/../bin/Rhubarb-Lip-Sync-1.13.0-Linux/rhubarb"  # Updated path for Rhubarb

# Make Binaries executable
chmod +x "$FFMPEG_PATH"
chmod +x "$RHUBARB_PATH"

# Check paths are correct by calling the binaries and checking version
"$FFMPEG_PATH" -version
"$RHUBARB_PATH" --version

# Verify they are now executable by checking for an "x" property
ls -l "$FFMPEG_PATH"
ls -l "$RHUBARB_PATH"
