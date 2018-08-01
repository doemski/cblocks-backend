class categoryMappingsRoutes {
  constructor(hapiServer, mappingsController) {
    this.hapiServer = hapiServer;
    this.mappingsController = mappingsController;
  }

  start() {
    this.hapiServer.route({
      'method': 'GET',
      'path': '/mappings/category/{mappingID?}',
      'handler': this.mappingsController.handleGetMappings.
        bind(this.mappingsController),
    });

    this.hapiServer.route({
      'method': 'PUT',
      'path': '/mappings/category/{mappingID}',
      'handler': this.mappingsController.handlePutMapping.
        bind(this.mappingsController),
    });

    this.hapiServer.route({
      'method': 'POST',
      'path': '/mappings/category',
      'handler': this.mappingsController.handlePostMapping.
        bind(this.mappingsController),
    });

    this.hapiServer.route({
      'method': 'DELETE',
      'path': '/mappings/category/{mappingID}',
      'handler': this.mappingsController.handleDeleteMapping.
        bind(this.mappingsController),
    });
  }
}

module.exports = categoryMappingsRoutes;
