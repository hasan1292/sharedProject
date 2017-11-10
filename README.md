# fanyi-pack_final
AVAILABLE ONLINE AT : http://128.199.224.137/

Community-based translation website. Each user can earn points by helping other to translate their posts. They can then use these points to ask the community to help them do translations.

## How to install on server

- first execute these
npm install
npm install express-session

- then modify this file
/Users/thomas/Documents/nodeJS/fanyi_v2/node_modules/bson/ext/index.js:15:10)
	change bson = require('../build/Release/bson');
	to bson = require('bson');

- run with "npm run-script prod"

## Import mock database 

Execute "./mock_user_data/create_mock_database.sh"
