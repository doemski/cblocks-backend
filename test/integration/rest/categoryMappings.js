const chai = require('chai');
const expect = chai.expect;
const cblockStubs = require('../../stubs/cblocks');
const mappingStubs = require('../../stubs/categoryMappings');
const util = require('../util.js');
const ObjectID = require('mongodb').ObjectID;
const wire = require('../../../wire');

const mappingsCollection = 'category-mappings';
const registryCollection = 'registry';

let hapiServer;
let registry;
let dataProvider;
let db;
let response;

const getMappingsRequestDefaults = {
  'method': 'GET',
  'url': '/mappings/category',
  'payload': {},
};

const postMappingRequestDefaults = {
  'method': 'POST',
  'url': '/mappings/category',
  'payload': {},
};

const putMappingRequestDefaults = {
  'method': 'PUT',
  'url': '/mappings/category',
  'payload': {},
};

const deleteMappingRequestDefaults = {
  'method': 'DELETE',
  'url': '/mappings/category',
  'payload': {},
};

describe('REST category mappings', () => {
  before(async () => {
    const mongoClient = await util.getMongo();
    const mqttClient = await util.getMQTT();
    hapiServer = await util.getHapi();
    db = mongoClient.db('cblocks');

    const app = wire(mongoClient, mqttClient, db, hapiServer);
    registry = app.dataProviders.registry;
    dataProvider = app.dataProviders.categoryMappingsDataProvider;
    app.rest.categoryMappingsRoutes.start();
  });

  beforeEach(() => {
    response = {};
    payload = {};
  });

  after(async () => {
    await Promise.all([
      await util.stopMongo(),
      await util.stopHapi(),
    ]);
  });

  afterEach(() => {
    db.collection(mappingsCollection).deleteMany({});
    db.collection(registryCollection).deleteMany({});
  });

  describe('GET mappings', () => {
    it('should return mappings',
      getMappingsShouldReturnMappings);

    it('should return empty array if not found',
      getMappingsShouldReturnEmptyArrayIfNotFound);
  });

  describe('GET mappings', () => {
    it('should return mapping if found',
      getMappingShouldReturnIfFound);

    it('should return 404 if not found',
      getMappingShouldReturn404IfNotFound);
  });

  describe('POST mapping', () => {
    it('should return mapping with id',
      postMappingShouldReturnMappingWithID);

    it('should fail with 404 if cblock not found',
      postMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 404 if instance not found',
      postMappingShouldRespond404IfInstanceNotFound);

    it('should fail with 400 if missing data',
      postMappingShouldFailWith400IfMissingData);
  });

  describe('PUT mapping', () => {
    it('should return updated version',
      putMappingShouldReturnUpdatedVersion);

    it('should fail with 404 if cblock not found',
      putMappingShouldRespond404IfCBlockDoesNotExist);

    it('should fail with 400 if missing data',
      putMappingShouldFailWith400IfMissingData);
  });

  describe('DELETE mapping', () => {
    it('should delete mapping if it exists',
      deleteMappingShouldReturn204);

    it('should return 404 if mapping not found',
      deleteMappingshouldReturn404IfNotFound);
  });
});

async function getMappingsShouldReturnMappings() {
  await givenMappings();

  await whenGetMappings();

  util.shouldReturnStatusCode(200);
  shouldReturnMappings();
}

async function givenMappings() {
  await Promise.all([
    dataProvider.createMapping(mappingStubs.humidityCategoryMapping),
    dataProvider.createMapping(mappingStubs.temperatureCategoryMapping),
  ]);
}

async function whenGetMappings() {
  response = await util.sendRequest(getMappingsRequestDefaults);
}

function shouldReturnMappings() {
  expect(response.payload.length).to.equal(2);
}

async function getMappingsShouldReturnEmptyArrayIfNotFound() {
  await whenGetMappings();

  util.shouldReturnStatusCode(200);
  shouldReturnEmptyArray();
}

function shouldReturnEmptyArray() {
  expect(response.payload.length).to.equal(0);
}

async function getMappingShouldReturnIfFound() {
  await givenMappings();

  await whenGetMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnMapping();
}

async function whenGetMapping() {
  const mappings = await dataProvider.getMappings();
  const id = mappings[0]['mappingID'];

  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await util.sendRequest(request);
}

function shouldReturnMapping() {
  expect(response.payload).to.include.all.keys('mappingID', 'label');
}

async function getMappingShouldReturn404IfNotFound() {
  await whenGetNonExistingMapping();

  util.shouldReturnStatusCode(404);
}

async function whenGetNonExistingMapping() {
  const id = new ObjectID();
  const request = {
    ...getMappingsRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await util.sendRequest(request);
}

async function postMappingShouldReturnMappingWithID() {
  await givenTemperatureCBlock();

  await whenPostMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnMappingWithID();
}

async function givenTemperatureCBlock() {
  await registry.updateObject(cblockStubs.temperature);
}

async function whenPostMapping() {
  let stub = {...mappingStubs.temperatureCategoryMapping};
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnMappingWithID() {
  expect(response.payload).to.include.all.keys('mappingID');
}

async function postMappingShouldRespond404IfCBlockDoesNotExist() {
  await whenPostMapping();

  util.shouldReturnStatusCode(404);
}

async function postMappingShouldRespond404IfInstanceNotFound() {
  await givenTemperatureCBlock();

  await whenPostMappingNonExistingInstance();

  util.shouldReturnStatusCode(404);
}

async function whenPostMappingNonExistingInstance() {
  let stub = {
    ...mappingStubs.temperatureCategoryMapping,
    instanceID: 99,
  };
  delete stub.mappingID;
  delete stub._id;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

async function postMappingShouldFailWith400IfMissingData() {
  await whenPostMappingWithoutLabel();

  util.shouldReturnStatusCode(400);
}

async function postMappingShouldFailWith400IfMissingData() {
  let stub = {
    ...mappingStubs.temperatureCategoryMapping,
  };
  delete stub.mappingID;
  delete stub.label;

  const request = {
    ...postMappingRequestDefaults,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

async function putMappingShouldReturnUpdatedVersion() {
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPutTemperatureMapping();

  util.shouldReturnStatusCode(200);
  shouldReturnUpdatedVersion();
}

async function whenPutTemperatureMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
    label: 'New Label',
  };
  delete stub.mappingID;

  const request = {
    ...putMappingRequestDefaults,
    'url': `/mappings/category/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

function shouldReturnUpdatedVersion() {
  expect(response.payload.label).to.equal('New Label');
}

async function putMappingShouldRespond404IfCBlockDoesNotExist() {
  await givenMappings();

  await whenPutTemperatureMapping();

  util.shouldReturnStatusCode(404);
}

async function putMappingShouldFailWith400IfMissingData() {
  await givenTemperatureCBlock();
  await givenMappings();

  await whenPutTemperatureMappingWithoutLabel();

  util.shouldReturnStatusCode(400);
}

async function whenPutTemperatureMappingWithoutLabel() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];
  let stub = {
    ...mappings[0],
  };
  delete stub._od;
  delete stub.default;

  const request = {
    ...putMappingRequestDefaults,
    'url': `/mappings/category/${id}`,
    'payload': stub,
  };

  response = await util.sendRequest(request);
}

async function deleteMappingShouldReturn204() {
  await givenMappings();

  await whenDeleteTemperatureMapping();

  util.shouldReturnStatusCode(204);
}

async function whenDeleteTemperatureMapping() {
  const mappings = (await dataProvider.getMappings()).filter(
    (m) => m.objectID === 3303);
  const id = mappings[0]['mappingID'];

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await util.sendRequest(request);
}

async function deleteMappingshouldReturn404IfNotFound() {
  await whenDeleteNoneExistingMapping();

  util.shouldReturnStatusCode(404);
}

async function whenDeleteNoneExistingMapping() {
  const id = new ObjectID();

  const request = {
    ...deleteMappingRequestDefaults,
    'url': `/mappings/category/${id}`,
  };

  response = await util.sendRequest(request);
}
