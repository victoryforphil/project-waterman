#! /bin/bash

# Install proto in headless mode (non-interactive)
# This avoids interactive prompts and shell profile modifications
# See: https://moonrepo.dev/docs/proto/install

# Verify proto is installed
if ! command -v proto &> /dev/null; then
    echo "proto could not be found, installing..."
    bash <(curl -fsSL https://moonrepo.dev/install/proto.sh) --yes --no-profile
fi


# Verify moon is installed
if ! command -v moon &> /dev/null; then
    echo "moon could not be found, installing..."
    bash <(curl -fsSL https://moonrepo.dev/install/moon.sh) --yes --no-profile
fi

