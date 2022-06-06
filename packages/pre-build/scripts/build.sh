rm -rf ./lib
babel src -d lib --config-file ./babel.config.js --extensions ".ts,.js"
tsc -b ./tsconfig.json
