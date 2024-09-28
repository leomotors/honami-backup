#!/bin/zsh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

export PATH="$PATH:/home/leomotors/.local/bin"

pnpm start >> run.log 2>&1
