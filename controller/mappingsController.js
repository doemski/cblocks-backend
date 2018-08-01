class MappingsController {
  constructor(mappingsUseCase, errorRenderer, putMappingValidator) {
    this.mappingsUseCase = mappingsUseCase;
    this.errorRenderer = errorRenderer;
    this.putMappingValidator = putMappingValidator;
  }

  async handleGetMappings(request) {
    try {
      return await this._getMappings(request);
    } catch (e) {
      throw this.errorRenderer.notFound(e.message);
    }
  }

  async _getMappings(request) {
    if (request.params.mappingID !== undefined) {
      return await this.mappingsUseCase.getMapping(
        request.params.mappingID);
    }

    return await this.mappingsUseCase.getMappings();
  }

  async handlePutMapping(request, h) {
    this._validatePutMapping(request.payload);

    try {
      const r = await this.mappingsUseCase.putMapping(
        request.params.mappingID, request.payload);

      return h.response(r);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }

  _validatePutMapping(payload) {
    try {
      this.putMappingValidator.validate(payload);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 400});
    }
  }

  async handlePostMapping(request, h) {
    this._validatePutMapping(request.payload);

    try {
      const r = await this.mappingsUseCase.createMapping(
        request.payload);

      return h.response(r);
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }

  async handleDeleteMapping(request, h) {
    try {
      await this.mappingsUseCase.deleteMapping(
        request.params.mappingID);

      return h.response('Ok.');
    } catch (e) {
      throw this.errorRenderer.boomify(e, {statusCode: 500});
    }
  }
}

module.exports = MappingsController;
