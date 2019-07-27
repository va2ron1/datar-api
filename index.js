var express = require('express');
const { Pool } = require('pg');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Setup IBM Watson natural language credentials
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: process.env.IBM_WATSON_VERSION,
  iam_apikey: process.env.IBM_WATSON_API_KEY,
  url: process.env.IBM_WATSON_URL
});

// Initialized express
var app = express();

// Database credentials
const connectionData = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
};
// Initialized postgres database pooling
let db = new Pool(connectionData);
db.sendQuery = (query) => {
  return new Promise((next, error) => {
    pool.query(query, [], (err, result) => {
      if (err)
      error(err);
      else
      next(result);
    });
  });
};

// Express configuration
app.use(express.json());

// Responses base
var responses = function (req, res, next) {
  res.out = (statusCode, json, msg) => {
    res.writeHead(statusCode, {'Content-Type': 'application/json', 'X-Powered-By': 'Data API Service'});
    res.end(JSON.stringify({status: res.statusMessage, data: json, message: msg}));
  };

  next();
};
app.use(responses);

// Auth key and cors verification callback for all endpoint
auth_key_cors = (req, res, next) => {
  // if auth key exists, then
  if (req.query.auth_key) {
    // lookup for auth key in database
    db.query('select key, origins from auth_keys where key = \'' + req.query.auth_key + '\' and enabled = true')
    .then(response => {
      // if the response is more than zero, means the auth key exist, then
      if (response.rowCount > 0) {
        const key = response.rows[0];
        const origins = key.origins;
        if (origins.indexOf(req.headers.origin) > -1) {
          res.header("Access-Control-Allow-Origin", req.headers.origin);
        } else {
          res.header("Access-Control-Allow-Origin", "https://datar.online");
        }
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        next();
      } else {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        return res.out(400, undefined, "API Key doesn't exist");
      }
    })
    .catch(err => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      return res.out(400, undefined, "API Key doesn't exist");
    });
  } else {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    return res.out(400, {
      "errors": [
        {
          "msg": "api key required",
          "param": "auth_key"
        }
      ]
    }, undefined);
  }
}
app.use(auth_key_cors);

// Post insertion request endpoint
app.post('/v1/data', auth_key_cors, (req, res, next) => {
  if (!req.body.data) {
    return res.out(400, {
      "errors": [
        {
          "msg": "data required",
          "param": "data"
        }
      ]
    }, undefined);
  }
  new Promise((resolve, reject) => {
    const origData = req.body.data;
    let index = 0;
    text = origData.replace(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?/g, () => {
      index++;
      return "{url" + index + "}";
    })

    const analyzeParams = {
      'features': {
        "keywords": {},
        "entities": {}
      },
      'text': text
    };

    naturalLanguageUnderstanding.analyze(analyzeParams)
    .then(analysisResults => {
      axios.post('http://localhost:9200/watson/_doc/', {
        createdAt: Math.floor(Date.now() / 1000),
        data: origData,
        result: analysisResults
      })
      .then((res) => {})
      .catch((error) => {
        // Something wrong with the search engine
      })
    })
    .catch(err => {
        // Something wrong with the request to ibm cloud
    });
  })
  return res.out(200, undefined, "Your request has been posted");
})

app.get('/v1/data', auth_key_cors, (req, res, next) => {
  if (!req.query.search) {
    return res.out(400, {
      "errors": [
        {
          "msg": "search required",
          "param": "search"
        }
      ]
    }, undefined);
  }
  axios.post('http://localhost:9200/watson/_search?filter_path=hits.hits._source', {
    "_source": {
      "includes": ["data"]
    },
    "query":{
      "bool":{
        "filter":[
          {
            "match":{
              "result.keywords.text": req.query.search
            }
          }
        ]
      }
    }
  })
  .then((response) => {
    response.data.hits.hits.forEach(function (obj, index) {
      // // Future rearrangement data for getting all data
    	// obj._source['entities'] = obj._source.result.entities;
    	// obj._source['keywords'] = obj._source.result.keywords;
    	// // remove keys (maybe in the future will needed)
    	// delete obj._source.result;
    	this[index] = obj._source;
    }, response.data.hits.hits);
    return res.out(200, response.data.hits.hits);
  })
  .catch((error) => {
    // Something happen or Nothing found in Elasticsearch
    return res.out(400, [{"data": "Nothing has been found with your search."}], "Nothing found");
  })
})

var port = process.env.PORT || 3001
app.listen(port, function () {
  console.log('DATAR API running at port', port, '!');
});
