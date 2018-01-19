import * as Posterior from 'posterior';
import * as store from 'store2';
import WSDL from './WSDL';
export class GenesisClient {
    constructor(config) {
        this.cfg = store.get('Genesis.config', {});
        if (config) {
            for (const key in config) {
                this.cfg[key] = config[key];
            }
        }
        this.configure('url', 'http://eshademo.cloudapp.net', false);
        this.configure('method', this.cfg.rest ? 'GET' : 'POST', false);
        this.configure('json', this.cfg.rest, false);
        this.configure('headers', this.cfg.rest
            ? {}
            : {
                'Content-Type': 'text/xml',
            }, false);
        this.Base = Posterior(this.cfg);
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
        if (override === true || !(key in this.cfg)) {
            this.cfg[key] = value;
        }
    }
}
if (window && document.body.hasAttribute('debug')) {
    window.GenesisClient = GenesisClient;
    window.store = store;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEtBQUssS0FBSyxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLElBQUksTUFBTSxRQUFRLENBQUM7QUFLMUIsTUFBTTtJQUtKLFlBQVksTUFBK0I7UUFFekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRzNDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUV4QixJQUFJLENBQUMsR0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQztRQUdELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxDQUNaLFNBQVMsRUFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUk7WUFDWCxDQUFDLENBQUMsRUFBRTtZQUNKLENBQUMsQ0FBQztnQkFDRSxjQUFjLEVBQUUsVUFBVTthQUMzQixFQUNMLEtBQUssQ0FDTixDQUFDO1FBR0YsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQzdCO1lBQ0UsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO1lBQ3BDLElBQUksRUFBRSxJQUFJO1lBQ1YsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJLEVBQUUsVUFBUyxHQUFRO2dCQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUIsTUFBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDeEQsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLEdBQUcsRUFBRSxZQUFZO2lCQUNsQjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0osR0FBRyxFQUFFLFdBQVc7aUJBQ2pCO2FBQ0Y7U0FDRixFQUNELFNBQVMsQ0FDVixDQUFDO0lBQ0osQ0FBQztJQUVPLFNBQVMsQ0FBQyxHQUFXLEVBQUUsS0FBVSxFQUFFLFdBQW9CLElBQUk7UUFDakUsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLEdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUM7Q0FDRjtBQUdELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsTUFBYyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDN0MsTUFBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDaEMsQ0FBQyJ9