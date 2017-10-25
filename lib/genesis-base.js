"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const posterior_1 = require("posterior");
const store2_1 = require("store2");
const xml2js_1 = require("xml2js");
const defaultConfig = { soap: true, mock: false };
const config = store2_1.default.get('demo.config', defaultConfig);
const GenesisService = posterior_1.default({
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
    window.store = store2_1.default;
    window.xml2js = xml2js_1.default;
    GenesisService().then(res => {
        console.log(res);
    });
}
exports.default = GenesisService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpcy1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVzaXMtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFrQztBQUNsQyxtQ0FBMkI7QUFDM0IsbUNBQTRCO0FBRTVCLE1BQU0sYUFBYSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDbEQsTUFBTSxNQUFNLEdBQUcsZ0JBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sY0FBYyxHQUFHLG1CQUFTLENBQUM7SUFDL0IsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJO1FBQ2QsQ0FBQyxDQUFDLHVCQUF1QjtRQUN6QixDQUFDLENBQUMsd0RBQXdEO0lBQzVELElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJO0lBQ2xCLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSTtRQUNsQixDQUFDLENBQUM7WUFDRSxjQUFjLEVBQUUsVUFBVTtTQUMzQjtRQUNILENBQUMsQ0FBQyxFQUFFO0NBQ1AsQ0FBQyxDQUFDO0FBR0gsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxNQUFjLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUMvQyxNQUFjLENBQUMsS0FBSyxHQUFHLGdCQUFLLENBQUM7SUFDN0IsTUFBYyxDQUFDLE1BQU0sR0FBRyxnQkFBTSxDQUFDO0lBRWhDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELGtCQUFlLGNBQWMsQ0FBQyJ9