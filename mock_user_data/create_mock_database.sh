
mongoimport -d test -c users --jsonArray --file users_mock.json
mongoimport -d test -c votes --jsonArray --file votes_mock.json
mongoimport -d test -c userposts --jsonArray --file userposts_mock.json