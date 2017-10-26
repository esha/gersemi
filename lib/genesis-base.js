import Posterior from 'posterior';
import store from 'store2';
import * as xml2js from 'xml2js';
const defaultConfig = { soap: true, mock: false };
const config = store.get('demo.config', defaultConfig);
export const GenesisService = Posterior({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxXQUFXLENBQUM7QUFDbEMsT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQzNCLE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE1BQU0sYUFBYSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDbEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDdkQsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQztJQUN0QyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUk7UUFDZCxDQUFDLENBQUMsdUJBQXVCO1FBQ3pCLENBQUMsQ0FBQyx3REFBd0Q7SUFDNUQsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUk7SUFDbEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJO1FBQ2xCLENBQUMsQ0FBQztZQUNFLGNBQWMsRUFBRSxVQUFVO1NBQzNCO1FBQ0gsQ0FBQyxDQUFDLEVBQUU7Q0FDUCxDQUFDLENBQUM7QUFHSCxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELE1BQWMsQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQy9DLE1BQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzdCLE1BQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ2xDLENBQUM7QUFFRCxlQUFlLGNBQWMsQ0FBQyJ9