'use strict';

/**
 * Assert Tool.
 */

var start = require('./common');
var db = start();
var mongoose = start.mongoose;
var assert = require('assert');
var superagent = require('superagent');
var async = require('async');
//Converter Class
var fs = require("fs");
var Converter = require("csvtojson").core.Converter;

var sample = require('./sample');
var words = require('./word_limit_jp'); 
var fwords = require('../lib/fwords');
var config = require('../config');

var root = 'localhost:8080';
var rootv = 'localhost:8080/' + config.version;
var cookie;
var account_id;
var community_id;

// Schema //
var member = require('../lib/models/member');
var account = require('../lib/models/account');
var community = require('../lib/models/community');
var board = require('../lib/models/board');
var comment = require('../lib/models/comment');
var image = require('../lib/models/image');
var data = require('../lib/models/data');
//var participate = require('../lib/models/participate');
//var viewer = require('../lib/models/viewer');
//var favorite = require('../lib/models/favorite');

// Model //
var Members = db.model('Member' , member);
var Accounts = db.model('Account' , account);
var Communities = db.model('Community' , community);
var Boards = db.model('Board' , board);
var Comments = db.model('Comment' , comment);
var Images = db.model('Image' , image);
var Datas = db.model('Data' , data);
//var Participates = db.model('Partcipate');
//var Viewers = db.model('Viewer');
//var Favorites = db.model('Favorite');

// signup 実行//
exports.debug_signup = function(next){
  superagent
    .post(root + '/signup')
    .field('name', sample.user.name)
    .field('email', sample.user.email)
    .field('password', sample.user.password)
    .field('birthday', sample.user.birthday)
    .field('gender', sample.user.gender)
    .end(function(err, res){
      assert.equal(res.statusCode, 200);
      next();
    });
};

// signup & login 実行//
exports.debug_signup_login = function(next){
  async.series([
    function(callback){
      superagent
      .post(root + '/signup')
      .field('name', sample.user.name)
      .field('email', sample.user.email)
      .field('password', sample.user.password)
      .field('birthday', sample.user.birthday)
      .field('gender', sample.user.gender)
      .end(function(err,res){
        callback();
      });
    }, function(callback) {
      superagent
      .post(root + '/login')
      .field('name_or_email', sample.user.name)
      .field('password', sample.user.password)
      .end(function(err,res){
        //console.log(res.header);
        //console.log(res.body._id);
        account_id = res.body._id
        cookie = res.headers['set-cookie'];
        callback();
      });
    }
  ], function(err){
    next(cookie , account_id);
    if (err) {throw err;}
  });
};

// logout 実行//
exports.debug_logout = function(next){
  superagent
  .get(root + '/logout')
  .end(function(err, res){
    assert.equal(res.statusCode, 200);
    next();
  });
};

// community 作成実行//
exports.debug_community = function(cookie , next){
  superagent 
  .post(rootv + '/communities/create')
  .set('cookie', cookie)
  .field('name', sample.community.name)
  .field('placemark[name]', sample.community.placemark.name)
  .field('placemark[thoroughfare]', sample.community.placemark.thoroughfare)
  .field('placemark[sub_thoroughfare]', sample.community.placemark.sub_thoroughfare)
  .field('placemark[locality]', sample.community.placemark.locality)
  .field('placemark[sub_locality]', sample.community.placemark.sub_locality)
  .field('placemark[administrative_area]', sample.community.placemark.administrative_area)
  .field('placemark[sub_administrative_area]', sample.community.placemark.sub_administrative_area)
  .field('placemark[postal_code]', sample.community.placemark.postal_code)
  .field('placemark[ISO_country_code]', sample.community.placemark.ISO_country_code)
  .field('placemark[country]', sample.community.placemark.country)
  .field('placemark[inland_water]', sample.community.placemark.inland_water)
  .field('placemark[ocean]', sample.community.placemark.ocean)
  .field('placemark[areas_of_interest]', sample.community.placemark.areas_of_interest)
  .field('geo[type]', sample.community.geo.type)
  .field('geo[coordinates]', sample.community.geo.coordinates[0])
  .field('geo[coordinates]', sample.community.geo.coordinates[1])
  .field('overview', sample.community.overview)
  .attach('main_image' , './test/test_image/png_test.png')
  .end(function(err,res){
    community_id = res.body._id;
    next(community_id);
  });
};

// community 複数 作成実行//
exports.debug_communities_create = function(cookie , next){
  var community_ids =[];
  async.forEach(sample.communities , function(community , cb){
    var url = './test/resource/'+Math.floor(Math.random() * 10)+'.jpg';
    if ( community.PLACEMARK !== undefined ) {
      superagent 
      .post(rootv + '/communities/create')
      .set('cookie', cookie)
      .field('name', community.NAME)
      .field('geo[type]', community.GEO.TYPE)
      .field('geo[coordinates]', community.GEO.COORDINATES[0])
      .field('geo[coordinates]', community.GEO.COORDINATES[1])
      .field('placemark[name]', community.PLACEMARK.NAME)
      .field('placemark[thoroughfare]', community.PLACEMARK.THOROUGHFARE)
      .field('placemark[sub_thoroughfare]', community.PLACEMARK.SUB_THOROUGHFARE)
      .field('placemark[locality]', community.PLACEMARK.LOCALITY)
      .field('placemark[sub_locality]', community.PLACEMARK.SUB_LOCALITY)
      .field('placemark[administrative_area]', community.PLACEMARK.ADMINISTRATIVE_AREA)
      .field('placemark[sub_administrative_area]', community.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
      .field('placemark[postal_code]', community.PLACEMARK.POSTAL_CODE)
      .field('placemark[ISO_country_code]', community.PLACEMARK.ISO_COUNTRY_CODE)
      .field('placemark[country]', community.PLACEMARK.COUNTRY)
      .field('placemark[inland_water]', community.PLACEMARK.INLAND_WATER)
      .field('placemark[ocean]', community.PLACEMARK.OCEAN)
      .field('placemark[areas_of_interest]', community.PLACEMARK.AREA_OF_INTEREST)
      .field('overview', community.OVERVIEW)
      .attach('main_image' , url)
      .end(function(err,res){
        community_ids.push(res.body._id);
        cb();
      });
    } else if (community.OVERVIEW !== undefined){
      superagent 
      .post(rootv + '/communities/create')
      .set('cookie', cookie)
      .field('name', community.NAME)
      .field('geo[type]', community.GEO.TYPE)
      .field('geo[coordinates]', community.GEO.COORDINATES[0])
      .field('geo[coordinates]', community.GEO.COORDINATES[1])
      .field('overview', community.OVERVIEW)
      .attach('main_image' , url)
      .end(function(err,res){
        community_ids.push(res.body._id);
        cb();
      });
    } else {
      superagent 
      .post(rootv + '/communities/create')
      .set('cookie', cookie)
      .field('name', community.NAME)
      .field('geo[type]', community.GEO.TYPE)
      .field('geo[coordinates]', community.GEO.COORDINATES[0])
      .field('geo[coordinates]', community.GEO.COORDINATES[1])
      .attach('main_image' , url)
      .end(function(err,res){
        community_ids.push(res.body._id);
        cb();
      });
    }
  }, function(err){
    if (err) { throw err; }
    next(community_ids);
  });
};

// board  作成実行//
exports.debug_board_create = function(cookie , account , community , next){
  var url = './test/resource/'+Math.floor(Math.random() * 10)+'.jpg';
  superagent 
  .post(rootv + '/boards/create')
  .set('cookie', cookie)
  .field('board_text', sample.board.board_text)
  .field('community_id', community)
  .field('community_effective_area', sample.board.community_effective_area)
  .field('owner', account)
  .field('placemark[name]', sample.board.placemark.name)
  .field('placemark[thoroughfare]', sample.board.placemark.thoroughfare)
  .field('placemark[sub_thoroughfare]', sample.board.placemark.sub_thoroughfare)
  .field('placemark[locality]', sample.board.placemark.locality)
  .field('placemark[sub_locality]', sample.board.placemark.sub_locality)
  .field('placemark[administrative_area]', sample.board.placemark.administrative_area)
  .field('placemark[sub_administrative_area]', sample.board.placemark.sub_administrative_area)
  .field('placemark[postal_code]', sample.board.placemark.postal_code)
  .field('placemark[ISO_country_code]', sample.board.placemark.ISO_country_code)
  .field('placemark[country]', sample.board.placemark.country)
  .field('placemark[inland_water]', sample.board.placemark.inland_water)
  .field('placemark[ocean]', sample.board.placemark.ocean)
  .field('placemark[areas_of_interest]', sample.board.placemark.areas_of_interest)
  .field('geo[type]', sample.board.geo.type)
  .field('geo[coordinates]', sample.board.geo.coordinates[0])
  .field('geo[coordinates]', sample.board.geo.coordinates[1])
  .attach('images' , url)
  .end(function(err,res){
    next();
  });
};

// boards  作成実行//
exports.debug_boards_create = function(cookie , account , community , next){
  async.forEach(sample.boards , function(board , cb){
  var img = Math.floor(Math.random() * 6);
  var url = './test/resource/'+Math.floor(Math.random() * 10)+'.jpg';
  var murl = './test/resource/m'+Math.floor(Math.random() * 10)+'.jpg';
  switch(img){
    case 0: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .end(function(err,res){
      cb();
    });
    break;
    case 1: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .attach('images' , url)
    .end(function(err,res){
      cb();
    });
    break;
    case 2: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .attach('images' , url)
    .attach('images2' , murl)
    .end(function(err,res){
      cb();
    });
    break;
    case 3: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .attach('images' , url)
    .attach('images2' , murl)
    .attach('images3' , url)
    .end(function(err,res){
      cb();
    });
    break;
    case 4: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .attach('images' , url)
    .attach('images2' , murl)
    .attach('images3' , url)
    .attach('images4' , murl)
    .end(function(err,res){
      cb();
    });
    break;
    case 5: 
    superagent 
    .post(rootv + '/boards/create')
    .set('cookie', cookie)
    .field('board_text', board.BOARD_TEXT)
    .field('community_id', community)
    .field('community_effective_area', board.COMMUNITY_EFFECTIVE_AREA)
    .field('owner', account)
    .field('placemark[name]', board.PLACEMARK.NAME)
    .field('placemark[thoroughfare]', board.PLACEMARK.THOROUGHFARE)
    .field('placemark[sub_thoroughfare]', board.PLACEMARK.SUB_THOROUGHFARE)
    .field('placemark[locality]', board.PLACEMARK.LOCALITY)
    .field('placemark[sub_locality]', board.PLACEMARK.SUB_LOCALITY)
    .field('placemark[administrative_area]', board.PLACEMARK.ADMINISTRATIVE_AREA)
    .field('placemark[sub_administrative_area]', board.PLACEMARK.SUB_ADMINISTRATIVE_AREA)
    .field('placemark[postal_code]', board.PLACEMARK.POSTAL_CODE)
    .field('placemark[ISO_country_code]', board.PLACEMARK.ISO_COUNTRY_CODE)
    .field('placemark[country]', board.PLACEMARK.COUNTRY)
    .field('placemark[inland_water]', board.PLACEMARK.INLAND_WATER)
    .field('placemark[ocean]', board.PLACEMARK.OCEAN)
    .field('placemark[areas_of_interest]', board.PLACEMARK.AREAS_OF_INTEREST)
    .field('geo[type]', board.GEO.TYPE)
    .field('geo[coordinates]', board.GEO.COORDINATES[0])
    .field('geo[coordinates]', board.GEO.COORDINATES[1])
    .attach('images' , url)
    .attach('images2' , murl)
    .attach('images3' , url)
    .attach('images4' , murl)
    .attach('images5' , url)
    .end(function(err,res){
      cb();
    });
    break;
    default:
      cb();
    break;
  }
  },function(err, res){
    next();
  });
};


// initialize //
exports.debug_refresh = function(next){
  async.series([
    function(callback){
      Members.count(function(err, results){
        console.log('Create Member is ' + results);
        if (err) {throw err;}
      });
      Members.remove(function(err){
        if (err) {throw err;}
        Members.count(function(err, results){
          console.log('Remove Member is ' + results);
          if (err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Accounts.count(function(err, results){
        if (err) {throw err;}
        console.log('Create Account is ' + results);
      });
      Accounts.remove(function(err){
        if (err) {throw err;}
        Accounts.count(function(err, results){
          console.log('Remove Account is ' + results);
          if (err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Communities.count(function(err, results){
        if(err) {throw err;}
        console.log('Create Communities is ' + results);
      });
      Communities.remove(function(err){
        if(err) {throw err;}
        Communities.count(function(err,results){
          console.log('Remove Communities is ' + results);
          if(err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Boards.count(function(err, results){
        if(err) {throw err;}
        console.log('Create Boards is ' + results);
      });
      Boards.remove(function(err){
        if(err) {throw err;}
        Boards.count(function(err, results){
          console.log('Remove Boards is ' + results);
          if(err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Comments.count(function(err, results){
        if(err) {throw err;}
        console.log('Create Comments is ' + results);
      });
      Comments.remove(function(err){
        if(err) {throw err;}
        Comments.count(function(err, results){
          console.log('Remove Comments is ' + results);
          if(err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Images.count(function(err, results){
        if(err) {throw err;}
        console.log('Create Images is ' + results);
      });
      Images.remove(function(err){
        if(err) {throw err;}
        Images.count(function(err, results){
          console.log('Remove Images is ' + results);
          if(err) {throw err;}
          callback();
        });
      });
    }, function(callback){
      Datas.count(function(err, results){
        if(err) {throw err;}
        console.log('Create Datas is ' + results);
      });
      Datas.remove(function(err){
        if(err) {throw err;}
        Datas.count(function(err, results){
          console.log('Remove Datas is ' + results);
          if(err) {throw err;}
          callback();
        });
      });
    }
  ], function(err){
    next();
    if (err) {throw err;}
  });
};

//最大文字数の入力作成
exports.wordlimit = function(configlimit, sample_length, next){
  var limit = [];
  for(var i = 0; i <= sample_length; i++){
    limit.push(words[configlimit + i]);
  }
  return next(limit);
};

//property保持確認
exports.propertyCheck = function(res, properties){
  async.forEach(properties,function(pro, cb){
    res.should.have.property(pro);
    cb();
  }, function(err){
    if (err) {throw err;}
    return;
  });
};

//csvをjsonに変換
exports.csvtojson = function(path,next){
  var fileStream = fs.createReadStream(path);
  //new converter instance
  var param={};
  var converter = new Converter(param);

  //end_parsed will be emitted once parsing finished
  converter.on("end_parsed", function (jsonObj) {
    //console.log(jsonObj); //here is your result json object
    return next(jsonObj);
  });

  //read from file
  fileStream.pipe(converter);

};

///////////////////////////////////////////////

exports.Client = function(path,opts,next){
  this.path = path;
  this.opts = opts;
  var name = opts.name;
  var cookie = opts.cookie;
  var geo = opts.geo;

  superagent
  .post(path)
  .set("cookie", cookie)
  .field("name", name)
  .field("geo[type]",geo.type)
  .field("geo[coordinates]",geo.coordinates[0])
  .field("geo[coordinates]",geo.coordinates[1])
  .attach("main_image" , './test/test_image/main_image.jpg')
  .end(function(res){
    next(res.body);
  });
};

