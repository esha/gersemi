import Posterior from 'posterior';
import store from 'store2';
import WSDL from './WSDL';
const defaultConfig = {
    rest: false,
    url: 'http://eshademo.cloudapp.net',
};
const config = store.get('demo.config', defaultConfig);
export class GenesisClient {
    constructor(baseConfig) {
        this.config = store.get('demo.config', defaultConfig);
        if (baseConfig) {
            for (const key in baseConfig) {
                this.config[key] = baseConfig[key];
            }
        }
        this.configure('method', config.rest ? 'GET' : 'POST', false);
        this.configure('json', config.rest, false);
        this.configure('headers', config.rest
            ? {}
            : {
                'Content-Type': 'text/xml',
            }, false);
        this.Base = Posterior(this.config);
        this.Service = this.Base.extend({
            method: { root: true, value: 'GET' },
            auto: true,
            singleton: true,
            then: function (xml) {
                const wsdl = new WSDL(xml);
                window[this._fn.cfg.name.toLowerCase()] = wsdl;
                return wsdl;
            },
            Children: {
                Query: {
                    url: 'query.wsdl',
                },
                Edit: {
                    url: 'edit.wsdl',
                },
            },
        }, 'Service');
    }
    configure(key, value, override = true) {
        if (override === true || !(key in this.config)) {
            this.config[key] = value;
        }
    }
}
if (window && document.body.hasAttribute('debug')) {
    window.GenesisClient = GenesisClient;
    window.store = store;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQzNCLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUUxQixNQUFNLGFBQWEsR0FBRztJQUNwQixJQUFJLEVBQUUsS0FBSztJQUNYLEdBQUcsRUFBRSw4QkFBOEI7Q0FDcEMsQ0FBQztBQUNGLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZELE1BQU07SUFLSixZQUFZLFVBQWtDO1FBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNmLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRTVCLElBQUksQ0FBQyxNQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUNaLFNBQVMsRUFDVCxNQUFNLENBQUMsSUFBSTtZQUNULENBQUMsQ0FBQyxFQUFFO1lBQ0osQ0FBQyxDQUFDO2dCQUNFLGNBQWMsRUFBRSxVQUFVO2FBQzNCLEVBQ0wsS0FBSyxDQUNOLENBQUM7UUFDRixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDN0I7WUFDRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7WUFDcEMsSUFBSSxFQUFFLElBQUk7WUFDVixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUksRUFBRSxVQUFTLEdBQVE7Z0JBQ3JCLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixNQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUN4RCxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELFFBQVEsRUFBRTtnQkFDUixLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLFlBQVk7aUJBQ2xCO2dCQUNELElBQUksRUFBRTtvQkFDSixHQUFHLEVBQUUsV0FBVztpQkFDakI7YUFDRjtTQUNGLEVBQ0QsU0FBUyxDQUNWLENBQUM7SUFDSixDQUFDO0lBRU8sU0FBUyxDQUFDLEdBQVcsRUFBRSxLQUFVLEVBQUUsV0FBb0IsSUFBSTtRQUNqRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsTUFBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNwQyxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBR0QsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxNQUFjLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUM3QyxNQUFjLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNoQyxDQUFDIn0=