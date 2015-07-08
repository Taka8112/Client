'use strict';

/**
 * Assert Tool.
 */

var start = require('../common');
var db = start();
var mongoose = start.mongoose;
var assert = require('assert');
var request = require('request');
var superagent = require('superagent');
var async = require('async');
var fs = require('fs');
var sample = require('../sample');
var config = require('../../config');

var http = 'http://';
var root = 'localhost:8080';
var rootv = 'localhost:8080/' + config.version;
var cookie;
var account_id;
var community_id;

// Schema //
var member = require('../../lib/models/member');
var account = require('../../lib/models/account');
var community = require('../../lib/models/community');
var board = require('../../lib/models/board');
var comment = require('../../lib/models/comment');
var image = require('../../lib/models/image');
var data = require('../../lib/models/data');
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

module.exports = Community;

function Community(path, opts) {

  this.path = path || "localhost:4040";
  this.opts = opts || {};

  return this;
};

Community.prototype.post = function(path, opts, next){

  var path = path || this.path || "";
  var opts = opts || this.opts || {};
  var cookie = opts.cookie || {};
  //var field = opts.field || {};
  //var attach = opts.attach || {};

  /*
     if(typeof next === function) {
     return Error('コールばっくないよ');
     }
     */
  

  var formData ={
    //attachments: fs.createReadStream(__dirname + '/test_image/main_image.jpg')
    attachments: fs.createReadStream(opts.main_image)
  };
  request({
    method: 'POST',
    url: http + path,
    formData: formData,
    postData: {
      params: 
        {name: opts.name,
          geo: {
            type: opts.geo.type,
            coordinates: opts.geo.coordinates
          }
      }
    },
    headers: {
      'cookie': cookie
    }
  }, function(err, res){
    next(null, res);
  });

 /*
  superagent
  .post(path)
  .set("cookie", cookie)
  .field('name', opts.name)
  .field('placemark[name]', opts.placemark.name)
  .field('placemark[thoroughfare]', opts.placemark.thoroughfare)
  .field('placemark[sub_thoroughfare]', opts.placemark.sub_thoroughfare)
  .field('placemark[locality]', opts.placemark.locality)
  .field('placemark[sub_locality]', opts.placemark.sub_locality)
  .field('placemark[administrative_area]', opts.placemark.administrative_area)
  .field('placemark[sub_administrative_area]', opts.placemark.sub_administrative_area)
  .field('placemark[postal_code]', opts.placemark.postal_code)
  .field('placemark[ISO_country_code]', opts.placemark.ISO_country_code)
  .field('placemark[country]', opts.placemark.country)
  .field('placemark[inland_water]', opts.placemark.inland_water)
  .field('placemark[ocean]', opts.placemark.ocean)
  .field('placemark[areas_of_interest]', opts.placemark.areas_of_interest)
  .field('geo[type]', opts.geo.type)
  .field('geo[coordinates]', opts.geo.coordinates[0])
  .field('geo[coordinates]', opts.geo.coordinates[1])
  .field('overview', opts.overview)
  .attach("main_image" , opts.main_image)
  .end(function(err, res){
    //console.log(res);
    next(null, res);
  });
 */

};


/*
module.exports = Community;

function Community() {
  var opts = {
    field: {
      'name': sample.community.name,
      'placemark[name]': sample.community.placemark.name,
      'placemark[thoroughfare]': sample.community.placemark.thoroughfare,
      'placemark[sub_thoroughfare]': sample.community.placemark.sub_thoroughfare,
      'placemark[locality]': sample.community.placemark.locality,
      'placemark[sub_locality]': sample.community.placemark.sub_locality,
      'placemark[administrative_area]': sample.community.placemark.administrative_area,
      'placemark[sub_administrative_area]': sample.community.placemark.sub_administrative_area,
      'placemark[postal_code]': sample.community.placemark.postal_code,
      'placemark[ISO_country_code]': sample.community.placemark.ISO_country_code,
      'placemark[country]': sample.community.placemark.country,
      'placemark[inland_water]': sample.community.placemark.inland_water,
      'placemark[ocean]': sample.community.placemark.ocean,
      'placemark[areas_of_interest]': sample.community.placemark.areas_of_interest,
      //'geo[type]': sample.community.geo.type,
      //'geo[coordinates]': sample.community.geo.coordinates[0],
      //'geo[coordinates]': sample.community.geo.coordinates[1],
      'overview': sample.community.overview
    },
    attach: {
      'main_image': './test/test_image/png_test.png'
    }
  };
  return opts;
};
*/

