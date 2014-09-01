node-mongres
-----------

REST API server/library for MongoDB


Description
-----------

The project was originally written to provide a **flattened** table view of MongoDB documents.
Then more and more features were added on both UI and api side, ...

It contains:

* a REST server for MongoDB (bin/mongres)
* the GUI (www/*)
* and a pluggable restful API library for any Express based http server (lib/*)


Install
-------

  `npm install node-mongres`


Run
---

* start REST server:
 * `node_modules/.bin/mongres [port]`
 * port=8765 is used by default if nothing is given at [port]
* Try with curl
 * `curl http://127.0.0.1/api/conn`


Full API
---

* Connection
 * `GET /conn` - all connected MongoDBs
 * `POST /conn` - connect to new MongoDB (POST connection params in body, {host: ..., port: ...})
 * `DELETE /conn/:connId` - disconnect
 * `GET /conn/:connId/buildInfo` - buildInfo of MongoDB from specified connection
 * `GET /conn/:connId/serverStatus` - serverStatus for specified MongoDB
 * `GET /conn/:connId/replSetGetStatus` - replSetGetStatus (if replSet is configured)

* Database
 * `GET /conn/:connId/db` - list all databases
 * `POST /conn/:connId/db` - create new database (POST database name in body, {name: ...})
 * `DELETE /conn/:connId/db/:dbId` - remove database
 * `GET /conn/:connId/db/:dbId` - get database stats

* Collection
 * `GET /conn/:connId/db/:dbId/col` - list all collections
 * `POST /conn/:connId/db/:dbId/col` - create new collection (POST collection name in body, {name: ...})
 * `DELETE /conn/:connId/db/:dbId/col/:colId` - remove collection
 * `GET /conn/:connId/db/:dbId/col/:colId` - get collection stats

* Document
 * `GET /conn/:connId/db/:dbId/col/:colId/doc?query=$QUERY&options=$OPTION` - list documents
  * see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find for more usage about **query** and **option**
  * query - use query to return a filtered result.
    * `query={"name":"aaa"}`
    * `query={"type":"A", "name":/^test/}` (support regex)
  * option - specify sorting, ... etc.
    * `option={"sort":{"a":1}}`
 * `POST /conn/:connId/db/:dbId/col/:colId/doc` - create new document (POST document contents in body)
 * `DELETE /conn/:connId/db/:dbId/col/:colId/doc` - remove multiple documents (POST document._id in an array in body, [_id, _id, ...])
 * `POST /conn/:connId/db/:dbId/col/:colId/doc/:docId` - update document (POST contents in body)
  * partially update, not replacing with the whole POST data
 * `GET /conn/:connId/db/:dbId/col/:colId/doc/:docId` - get a single document
 * `DELETE /conn/:connId/db/:dbId/col/:colId/doc/:docId` - delete a single document

Advanced
--------

### Path name of API is customizable

see `examples` folder.

### API is pluggable

API can be plugged into any Express based server at any path.
see `examples` folder.

