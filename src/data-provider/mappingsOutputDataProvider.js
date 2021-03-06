const ObjectID = require('mongodb').ObjectID;
const DEFAULT_RECORD_LIMIT = 50;

class MappingsOutputDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async record(mappingID, from, to, timestamp, createdAt) {
    await this.collection.insert({
      'mappingID': new ObjectID(mappingID),
      from, to, timestamp, createdAt,
    });
  }

  async getRecords(mappingID, limit) {
    if (limit === 0) return [];

    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection
      .find({
        'mappingID': new ObjectID(mappingID),
      })
      .sort({
        'timestamp': -1,
      })
      .limit(limit)
    ).toArray();

    return records.map(({_id, mappingID, ...rest}) => ({
      id: _id.toHexString(),
      mappingID: mappingID.toHexString(),
      ...rest,
    }));
  }

  async getRecordsByTo(mappingID, to, limit) {
    if (limit === 0) return [];

    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection
      .find({
        'mappingID': new ObjectID(mappingID),
        to}
      )
      .sort({
        'timestamp': -1,
      })
      .limit(limit)
    ).toArray();

    return records.map(({_id, mappingID, ...rest}) => ({
      id: _id.toHexString(),
      mappingID: mappingID.toHexString(),
      ...rest,
    }));
  }
}

module.exports = MappingsOutputDataProvider;
