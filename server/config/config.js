//
//  Puerto
//
process.env.PORT = process.env.PORT || 3000;

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//------------Data base
let urlDB;

if (process.env.NODE_ENV === 'dev')
    urlDB = 'mongodb://localhost:27017/cafe';
else
    urlDB = 'mongodb+srv://admin:eYDQ2yt7H3hD9B8C@cluster0-ctarh.mongodb.net/cafe';

process.env.URLDB = urlDB;