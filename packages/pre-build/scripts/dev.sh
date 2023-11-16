rm -rf ./lib
babel src -d lib --config-file ./babel.config.js --extensions ".ts,.js" -w
tsc -b ./tsconfig.json -w
