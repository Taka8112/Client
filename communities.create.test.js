
'use strict';

/**
 * Module dependencies.
 */

var start = require("./common");
var mongoose = start.mongoose;
var assert = require("assert");
var should = require("should");
var superagent = require("superagent");

var request = require("request");
var fs = require('fs');

var async = require("async");
var config = require("../config");
var fwords = require("../lib/fwords");
var sample = require("./sample");
var properties = require("./properties");

var assert_tool = require("./assert_tool");
var debug_signup_login = assert_tool.debug_signup_login;
var debug_refresh = assert_tool.debug_refresh;
var wordlimit = assert_tool.wordlimit;
var propertyCheck = assert_tool.propertyCheck;
var csvtojson = assert_tool.csvtojson;

var Community = require("./helper/community")
//var Client = require("../helper/client")

/**
 * Test
 */

var root = "localhost:8080";
var rootv = "localhost:8080/" + config.version;
var URI= [
  "/communities/nearby",
  "/communities/hot",
  "/communities/show/:id",
  "/communities/user_timeline",
  "/communities/favorite_timeline",
  "/communities/join_timeline",
  "/communities/view_timeline",
  "/communities/create",
  "/communities/update/:id",
  "/communities/update_image/:type",
  "/communities/destroy/:id",
  "/communities/open/:id",
  "/communities/suspend/:id",
  "/communities/close/:id",
  "/communities/favorite/create",
  "/communities/favorite/destroy",
  "/communities/participant/create",
  "/communities/participant/exit"
];

var cookie;
var db = start();
var id;
var opts; 
var num = [];
var uri = URI[7];
var path = (rootv + uri).replace(':id', id);
var file = __dirname +"/checklist/test.csv";
//var ses  = ["ON" , "OFF"] // 0:session ON , 1:session OFF
var ses = ["ON"];

describe("Communities", function () {

  before(function(done){
    var tasks = [];

    tasks.push(function(next){
      debug_refresh(function(){
        debug_signup_login(function(login){
          cookie = login;
          next(null);
        });
      });
    });

    async.waterfall(tasks, function(err){
      done();
    });
  });

  async.forEach(ses,function(session, callback){
    describe(',session ' + session, function(){
      it(',test ', function(done){
        csvtojson(file, function(test){
          opts = test;

          var community = new Community(path, opts);
          async.forEach(opts,function(op, cb){

            if (session === 'ON'){
              op.cookie = cookie;
            } else {
              op.cookie = null;
            }

            community.post(path,op,function(err, res){
              console.log(res);
              cb();
            });
          }, function(err){
            if (err) {throw err;}
            done();
          });
        });
      });
    });
  }, function(err){
    callback();
    if (err) {throw err;}
  });
});

