
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

var assert_tool = require("./assert_tool");
var debug_signup_login = assert_tool.debug_signup_login;
var debug_refresh = assert_tool.debug_refresh;
var wordlimit = assert_tool.wordlimit;
var propertyCheck = assert_tool.propertyCheck;
var csvtojson = assert_tool.csvtojson;

var Community = require("./helper/community")

/**
 * Test
 */

var root = "localhost:8080";
var rootv = "localhost:8080/" + config.version;

var cookie;
var db = start();
var id;
var opts; 
var uri = "/communities/create";
var path = (rootv + uri).replace(':id', id);
var file = __dirname +"/checklist/test.csv";
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

  describe(',session ', function(){
    it(',test ', function(done){

      var formData ={
        attachments: fs.createReadStream(__dirname + '/test_image/main_image.jpg' )
      }

      request({
        method: 'POST',
        url: 'http://' + path,
        headers:{
          'cookie': cookie
        },
        multipart:{
          data: [
            {
              'content-type': 'application/json',
              body: JSON.stringify({
                name:'nogu',
                geo: {
                  type:'Point',
                  coordinates: [123 ,45],
                  formData: formData
                }
              })
            }
          ]
        },
      }, function(err, res){
        console.log(res);
        done();
      });
    });
  });
});

