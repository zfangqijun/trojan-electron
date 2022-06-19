const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const Paths = require('../../paths')

const getServiceClientConstructor = function () {
    /**
     * @type {import('@grpc/grpc-js').ServiceClientConstructor}
     */
    let TrojanClientService;
    return async function () {
        if (TrojanClientService) return TrojanClientService
        const packageDefinition = await protoLoader.load(Paths.TrojanApiProto);
        const grpcObject = grpc.loadPackageDefinition(packageDefinition);

        TrojanClientService = grpcObject.trojan.api.TrojanClientService;
        return TrojanClientService;
    }
}()


module.exports = {
    getServiceClientConstructor
}
