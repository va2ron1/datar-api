# DATAR API
Environment variables (.env)

    POSTGRES_DB=''
    POSTGRES_HOST='localhost'
    POSTGRES_USER='postgres'
    POSTGRES_PASSWORD=''
    IBM_WATSON_URL='https://gateway.watsonplatform.net/natural-language-understanding/api'
    IBM_WATSON_VERSION='2018-11-16'
    IBM_WATSON_API_KEY=''
**Note:** Use the same database from [DATAR API Keys Management](https://github.com/va2ron1/datar-management)
## Requirements

- Linux Server (Ubuntu 18.04 recommended)
- [IBM Watson Natural Language Understanding API Key](https://www.ibm.com/watson/services/natural-language-understanding/)
- Node.js v10 or later
- PostgreSQL 10 or later
- [DATAR API Keys Management](https://github.com/va2ron1/datar-management) running
- [Elasticsearch 7.2.0 (Apache 2.0)](https://www.elastic.co/guide/en/elasticsearch/reference/7.2/deb.html) running
## Install

```bash
npm install
```

## Usage

```bash
npm start
```
# Documentation 
The API Documentation is located at 
https://github.com/va2ron1/datar-api/wiki/API-Documentation

# Changes
The project has been split into a few parts:
### Core

- [DATAR API Keys Management](https://github.com/va2ron1/datar-management)
- [DATAR API](https://github.com/va2ron1/datar-api)
### Demos
- [Web platform](https://github.com/va2ron1/datar-web-demo) (rebuilt from scratch in Vue.js)
- [Mobile App](https://github.com/va2ron1/datar-ios-demo) (iOS version) (rebuilt from scratch)
- [Text Messaging](https://github.com/va2ron1/datar-sms-demo) (# Not available)
# License
See [Apache License 2.0](https://github.com/va2ron1/datar-node-api/blob/master/LICENSE)
