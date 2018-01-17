import Posterior from 'posterior';
export declare class GenesisClient {
    Base: Posterior.Requester;
    Service: Posterior.Requester;
    config: Posterior.InputConfig;
    constructor(baseConfig: {
        [key: string]: any;
    });
    private configure(key, value, override?);
}
