import * as Posterior from 'posterior';
export declare type GenesisConfig = Posterior.InputConfig & {
    rest: boolean;
};
export declare class GenesisClient {
    Base: Posterior.Requester;
    Service: Posterior.Requester;
    cfg: GenesisConfig;
    constructor(config?: {
        [key: string]: any;
    });
    private configure(key, value, override?);
}
