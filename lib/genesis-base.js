import Posterior from 'posterior';
import store from 'store2';
import * as xml2js from 'xml2js';
const defaultConfig = { soap: true, mock: false };
const config = store.get('demo.config', defaultConfig);
const GenesisService = Posterior({
    url: config.mock
        ? 'http://localhost:8000'
        : 'http://eshademo.cloudapp.net/soap/FoodQueryService.svc',
    json: !config.soap,
    headers: config.soap
        ? {
            'Content-Type': 'text/xml',
        }
        : {},
});
if (window && document.body.hasAttribute('debug')) {
    window.GenesisService = GenesisService;
    window.store = store;
    window.xml2js = xml2js;
}
export default GenesisService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQzNCLE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE1BQU0sYUFBYSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDbEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDdkQsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQy9CLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSTtRQUNkLENBQUMsQ0FBQyx1QkFBdUI7UUFDekIsQ0FBQyxDQUFDLHdEQUF3RDtJQUM1RCxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSTtJQUNsQixPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUk7UUFDbEIsQ0FBQyxDQUFDO1lBQ0UsY0FBYyxFQUFFLFVBQVU7U0FDM0I7UUFDSCxDQUFDLENBQUMsRUFBRTtDQUNQLENBQUMsQ0FBQztBQUdILEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsTUFBYyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDL0MsTUFBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDN0IsTUFBYyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbEMsQ0FBQztBQUVELGVBQWUsY0FBYyxDQUFDIn0=