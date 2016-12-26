# fanyi-pack_final
Community-based translation platform

*** IMPORTANT ******

- first execute these
npm install
npm install express-session

- then modify this file
/Users/thomas/Documents/nodeJS/fanyi_v2/node_modules/bson/ext/index.js:15:10)
	change bson = require('../build/Release/bson');
	to bson = require('bson');

*** Import mock database ***
//How to import : mongoimport --db test --collection users mock_data.json
//How to import : mongoimport --db test --collection userspost userspost_mock.json
