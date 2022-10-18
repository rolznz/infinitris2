Generates PNG/JPG files

- PNG generator for world images
- JPG generator for illustrations

Example commands

- yarn start
- GENERATE_VARIATIONS=false yarn start
- FILE_FILTER=rock2 yarn start
- DIR_FILTER=desert yarn start
- ASSETS_DIRECTORY=cells OUTPUT_SIZE=64 yarn start
- ASSETS_DIRECTORY=cells READ_CHILD_DIRECTORIES=false GENERATE_VARIATIONS=false OUTPUT_SIZE=64 yarn start
- ASSETS_DIRECTORY=nickname READ_CHILD_DIRECTORIES=false GENERATE_VARIATIONS=false yarn start
- ASSETS_DIRECTORY=challenge-previews READ_CHILD_DIRECTORIES=false GENERATE_VARIATIONS=false yarn start
- EXTENSION=.jpg ASSETS_DIRECTORY=../../../app/src/components/pages/PremiumPage/assets READ_CHILD_DIRECTORIES=false GENERATE_VARIATIONS=false yarn start
- EXTENSION=.jpg ASSETS_DIRECTORY=../../../app/src/components/ui/GameModePicker READ_CHILD_DIRECTORIES=false GENERATE_VARIATIONS=false yarn start
