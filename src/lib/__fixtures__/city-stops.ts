// Captured from Transitous /api/v1/map/stops (15 km box per city).
// Rail-station stops only, deduplicated by name + rounded position.
import type { GeocodeHitLike } from "../station-classify";

export type CityStopsFixture = { city: GeocodeHitLike; stops: GeocodeHitLike[] };

export const CITY_STOPS_FIXTURES: Record<string, CityStopsFixture> = {
    "London": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "London",
        "lat": 51.507446,
        "lon": -0.127765,
        "country": "GB"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "London St Pancras (GB)",
          "stopId": "be-sncb_7015400",
          "lat": 51.53063,
          "lon": -0.12548,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0020368376281112432
        },
        {
          "type": "STOP",
          "name": "Alexandra Palace",
          "stopId": "gb-great-britain_9100ALEXNDP3",
          "lat": 51.59795,
          "lon": -0.1206,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.026182804256677628
        },
        {
          "type": "STOP",
          "name": "Alexandra Palace",
          "stopId": "gb-great-britain_9100ALEXNDP2",
          "lat": 51.59807,
          "lon": -0.12042,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.026182804256677628
        },
        {
          "type": "STOP",
          "name": "Alexandra Palace",
          "stopId": "gb-great-britain_9100ALEXNDP4",
          "lat": 51.59807,
          "lon": -0.12046,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.026182804256677628
        },
        {
          "type": "STOP",
          "name": "Alexandra Palace",
          "stopId": "gb-great-britain_9100ALEXNDP1",
          "lat": 51.59818,
          "lon": -0.12034,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026182804256677628
        },
        {
          "type": "STOP",
          "name": "Bowes Park",
          "stopId": "gb-great-britain_9100BOWESPK1",
          "lat": 51.60701,
          "lon": -0.12058,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009230202063918114
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK7",
          "lat": 51.56471,
          "lon": -0.10661,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK5",
          "lat": 51.56484,
          "lon": -0.10638,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK4",
          "lat": 51.56491,
          "lon": -0.1062,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK2",
          "lat": 51.56501,
          "lon": -0.10601,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK1",
          "lat": 51.56507,
          "lon": -0.10594,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "Finsbury Park",
          "stopId": "gb-great-britain_9100FNPK8",
          "lat": 51.56476,
          "lon": -0.10666,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.15846045315265656
        },
        {
          "type": "STOP",
          "name": "St-Pancras-International",
          "stopId": "fr-eurostar-gtfs-plan-de-transport-et-temps-reel_st_pancras_international_8",
          "lat": 51.53142,
          "lon": -0.12613,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.01382546778768301
        },
        {
          "type": "STOP",
          "name": "North Sheen",
          "stopId": "gb-great-britain_9100NSHEEN",
          "lat": 51.46532,
          "lon": -0.28658,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008908499032258987
        },
        {
          "type": "STOP",
          "name": "Richmond",
          "stopId": "gb-great-britain_9100RICHMND",
          "lat": 51.46299,
          "lon": -0.30065,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04847553372383118
        },
        {
          "type": "STOP",
          "name": "Richmond",
          "stopId": "gb-great-britain_9100RICHMND2",
          "lat": 51.46307,
          "lon": -0.30077,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04847553372383118
        },
        {
          "type": "STOP",
          "name": "Drayton Green",
          "stopId": "gb-great-britain_9100DRAYGRN",
          "lat": 51.51638,
          "lon": -0.33019,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.013288312591612339
        },
        {
          "type": "STOP",
          "name": "Brentford",
          "stopId": "gb-great-britain_9100BNTFORD",
          "lat": 51.48766,
          "lon": -0.30968,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009329861961305141
        },
        {
          "type": "STOP",
          "name": "Ealing Broadway",
          "stopId": "gb-great-britain_9100EALINGB",
          "lat": 51.51465,
          "lon": -0.3001,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.06430279463529587
        },
        {
          "type": "STOP",
          "name": "Ealing Broadway",
          "stopId": "gb-great-britain_9100EALINGB2",
          "lat": 51.51476,
          "lon": -0.30013,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.06430279463529587
        },
        {
          "type": "STOP",
          "name": "Ealing Broadway",
          "stopId": "gb-great-britain_9100EALINGB3",
          "lat": 51.51481,
          "lon": -0.29999,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.06430279463529587
        },
        {
          "type": "STOP",
          "name": "Ealing Broadway",
          "stopId": "gb-great-britain_9100EALINGB4",
          "lat": 51.5149,
          "lon": -0.30029,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.06430279463529587
        },
        {
          "type": "STOP",
          "name": "Barking",
          "stopId": "gb-great-britain_9100BARKING8",
          "lat": 51.53994,
          "lon": 0.07956,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08907602727413177
        },
        {
          "type": "STOP",
          "name": "Barking",
          "stopId": "gb-great-britain_9100BARKING7",
          "lat": 51.53997,
          "lon": 0.07958,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08907602727413177
        },
        {
          "type": "STOP",
          "name": "Barking",
          "stopId": "gb-great-britain_9100BARKING5",
          "lat": 51.54013,
          "lon": 0.07959,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08907602727413177
        },
        {
          "type": "STOP",
          "name": "Barking",
          "stopId": "gb-great-britain_9100BARKING4",
          "lat": 51.54022,
          "lon": 0.07966,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08907602727413177
        },
        {
          "type": "STOP",
          "name": "Hornsey",
          "stopId": "gb-great-britain_9100HRNSY",
          "lat": 51.58632,
          "lon": -0.11168,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016531622037291527
        },
        {
          "type": "STOP",
          "name": "Barnes Bridge",
          "stopId": "gb-great-britain_9100BNSBDGE",
          "lat": 51.47201,
          "lon": -0.25263,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00950729288160801
        },
        {
          "type": "STOP",
          "name": "Bellingham",
          "stopId": "gb-great-britain_9100BELNGHM2",
          "lat": 51.43359,
          "lon": -0.0196,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0072456724010407925
        },
        {
          "type": "STOP",
          "name": "Bellingham",
          "stopId": "gb-great-britain_9100BELNGHM2",
          "lat": 51.43353,
          "lon": -0.01975,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0072456724010407925
        },
        {
          "type": "STOP",
          "name": "Hayes",
          "stopId": "gb-great-britain_9100HAYS2",
          "lat": 51.37672,
          "lon": 0.0087,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.011960117146372795
        },
        {
          "type": "STOP",
          "name": "Hackney Downs",
          "stopId": "gb-great-britain_9100HAKNYNM4",
          "lat": 51.54821,
          "lon": -0.06058,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02962353825569153
        },
        {
          "type": "STOP",
          "name": "Hackney Downs",
          "stopId": "gb-great-britain_9100HAKNYNM3",
          "lat": 51.5487,
          "lon": -0.06073,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02962353825569153
        },
        {
          "type": "STOP",
          "name": "Hackney Downs",
          "stopId": "gb-great-britain_9100HAKNYNM1",
          "lat": 51.54858,
          "lon": -0.06041,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02962353825569153
        },
        {
          "type": "STOP",
          "name": "Honor Oak Park",
          "stopId": "gb-great-britain_9100HONROPK1",
          "lat": 51.45055,
          "lon": -0.04507,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.027880214154720306
        },
        {
          "type": "STOP",
          "name": "Honor Oak Park",
          "stopId": "gb-great-britain_9100HONROPK2",
          "lat": 51.45036,
          "lon": -0.04498,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.027880214154720306
        },
        {
          "type": "STOP",
          "name": "Herne Hill",
          "stopId": "gb-great-britain_9100HERNEH1",
          "lat": 51.454,
          "lon": -0.1028,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02502940595149994
        },
        {
          "type": "STOP",
          "name": "Herne Hill",
          "stopId": "gb-great-britain_9100HERNEH",
          "lat": 51.45395,
          "lon": -0.10269,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02502940595149994
        },
        {
          "type": "STOP",
          "name": "Herne Hill",
          "stopId": "gb-great-britain_9100HERNEH3",
          "lat": 51.45398,
          "lon": -0.10256,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02502940595149994
        },
        {
          "type": "STOP",
          "name": "Herne Hill",
          "stopId": "gb-great-britain_9100HERNEH4",
          "lat": 51.4539,
          "lon": -0.10243,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02502940595149994
        },
        {
          "type": "STOP",
          "name": "Imperial Wharf",
          "stopId": "gb-great-britain_9100CSEAH1",
          "lat": 51.47564,
          "lon": -0.18332,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0156265702098608
        },
        {
          "type": "STOP",
          "name": "Imperial Wharf",
          "stopId": "gb-great-britain_9100CSEAH2",
          "lat": 51.47563,
          "lon": -0.18347,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0156265702098608
        },
        {
          "type": "STOP",
          "name": "Hampton Wick",
          "stopId": "gb-great-britain_9100HAMWICK2",
          "lat": 51.41452,
          "lon": -0.31249,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013802483677864075
        },
        {
          "type": "STOP",
          "name": "Eltham",
          "stopId": "gb-great-britain_9100ELTHAM",
          "lat": 51.45559,
          "lon": 0.05227,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.017198922112584114
        },
        {
          "type": "STOP",
          "name": "Elmers End",
          "stopId": "gb-great-britain_9100ELMERSE",
          "lat": 51.39801,
          "lon": -0.0497,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012490466237068176
        },
        {
          "type": "STOP",
          "name": "Deptford",
          "stopId": "gb-great-britain_9100DEPTFD",
          "lat": 51.47898,
          "lon": -0.02664,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.013324462808668613
        },
        {
          "type": "STOP",
          "name": "Nunhead",
          "stopId": "gb-great-britain_9100NUNHEAD1",
          "lat": 51.46683,
          "lon": -0.05227,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.013254533521831036
        },
        {
          "type": "STOP",
          "name": "Elephant & Castle",
          "stopId": "gb-great-britain_9100ELPHNAC4",
          "lat": 51.4939,
          "lon": -0.09859,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10796008259057999
        },
        {
          "type": "STOP",
          "name": "Elephant & Castle",
          "stopId": "gb-great-britain_9100ELPHNAC3",
          "lat": 51.49397,
          "lon": -0.09873,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10796008259057999
        },
        {
          "type": "STOP",
          "name": "Elephant & Castle",
          "stopId": "gb-great-britain_9100ELPHNAC1",
          "lat": 51.49379,
          "lon": -0.09897,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10796008259057999
        },
        {
          "type": "STOP",
          "name": "Meridian Water",
          "stopId": "gb-great-britain_9100MWRWSTN2",
          "lat": 51.6104,
          "lon": -0.04989,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008422174490988255
        },
        {
          "type": "STOP",
          "name": "Meridian Water",
          "stopId": "gb-great-britain_9100MWRWSTN3",
          "lat": 51.6104,
          "lon": -0.04995,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008422174490988255
        },
        {
          "type": "STOP",
          "name": "Meridian Water",
          "stopId": "gb-great-britain_9100MWRWSTN4",
          "lat": 51.61038,
          "lon": -0.05011,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008422174490988255
        },
        {
          "type": "STOP",
          "name": "Drayton Park",
          "stopId": "gb-great-britain_9100DRYP",
          "lat": 51.5531,
          "lon": -0.10577,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.017994150519371033
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW6",
          "lat": 51.46492,
          "lon": -0.17054,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW5",
          "lat": 51.46495,
          "lon": -0.17059,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW4",
          "lat": 51.46502,
          "lon": -0.17072,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW3",
          "lat": 51.46503,
          "lon": -0.17083,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW",
          "lat": 51.4645,
          "lon": -0.17069,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJM10",
          "lat": 51.46411,
          "lon": -0.17051,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJM9",
          "lat": 51.46413,
          "lon": -0.17064,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJM7",
          "lat": 51.46364,
          "lon": -0.17149,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJC17",
          "lat": 51.46408,
          "lon": -0.16939,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJC15",
          "lat": 51.4641,
          "lon": -0.16967,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJW6",
          "lat": 51.46395,
          "lon": -0.16974,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJC14",
          "lat": 51.46402,
          "lon": -0.16999,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJC13",
          "lat": 51.4641,
          "lon": -0.17001,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJC12",
          "lat": 51.46423,
          "lon": -0.17006,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Clapham Junction",
          "stopId": "gb-great-britain_9100CLPHMJM11",
          "lat": 51.46421,
          "lon": -0.17017,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.19185085594654083
        },
        {
          "type": "STOP",
          "name": "Queens Road",
          "stopId": "gb-great-britain_9100PCKHMQD2",
          "lat": 51.47434,
          "lon": -0.05689,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.021748442202806473
        },
        {
          "type": "STOP",
          "name": "Plumstead",
          "stopId": "gb-great-britain_9100PLMS2",
          "lat": 51.48982,
          "lon": 0.0839,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01902233622968197
        },
        {
          "type": "STOP",
          "name": "Plumstead",
          "stopId": "gb-great-britain_9100PLMS1",
          "lat": 51.4897,
          "lon": 0.08356,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01902233622968197
        },
        {
          "type": "STOP",
          "name": "Putney",
          "stopId": "gb-great-britain_9100PUTNEY",
          "lat": 51.46093,
          "lon": -0.21535,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.02364831045269966
        },
        {
          "type": "STOP",
          "name": "Raynes Park",
          "stopId": "gb-great-britain_9100RAYNSPK",
          "lat": 51.40897,
          "lon": -0.23054,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.03441253677010536
        },
        {
          "type": "STOP",
          "name": "Queenstown Road",
          "stopId": "gb-great-britain_9100QTRDBAT",
          "lat": 51.47475,
          "lon": -0.14716,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013461222872138023
        },
        {
          "type": "STOP",
          "name": "Balham",
          "stopId": "gb-great-britain_9100BALHAM4",
          "lat": 51.4428,
          "lon": -0.15112,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08234283328056335
        },
        {
          "type": "STOP",
          "name": "Balham",
          "stopId": "gb-great-britain_9100BALHAM4",
          "lat": 51.44272,
          "lon": -0.15105,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08234283328056335
        },
        {
          "type": "STOP",
          "name": "Balham",
          "stopId": "gb-great-britain_9100BALHAM1",
          "lat": 51.44287,
          "lon": -0.1512,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08234283328056335
        },
        {
          "type": "STOP",
          "name": "Beckenham Junction",
          "stopId": "gb-great-britain_9100BCKNMJC",
          "lat": 51.4112,
          "lon": -0.02724,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.019022414460778236
        },
        {
          "type": "STOP",
          "name": "Beckenham Junction",
          "stopId": "gb-great-britain_9100BCKNHMJ2",
          "lat": 51.41115,
          "lon": -0.02739,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019022414460778236
        },
        {
          "type": "STOP",
          "name": "Beckenham Junction",
          "stopId": "gb-great-britain_9100BCKNHMJ3",
          "lat": 51.41119,
          "lon": -0.02697,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019022414460778236
        },
        {
          "type": "STOP",
          "name": "Beckenham Junction",
          "stopId": "gb-great-britain_9100BCKNHMJ4",
          "lat": 51.41123,
          "lon": -0.02669,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.019022414460778236
        },
        {
          "type": "STOP",
          "name": "Battersea Park",
          "stopId": "gb-great-britain_9100BATRSPK2",
          "lat": 51.47696,
          "lon": -0.14753,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.022527344524860382
        },
        {
          "type": "STOP",
          "name": "Barnes",
          "stopId": "gb-great-britain_9100BARNES4",
          "lat": 51.46656,
          "lon": -0.24058,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.017651941627264023
        },
        {
          "type": "STOP",
          "name": "Barnes",
          "stopId": "gb-great-britain_9100BARNES3",
          "lat": 51.46672,
          "lon": -0.24083,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.017651941627264023
        },
        {
          "type": "STOP",
          "name": "Barnes",
          "stopId": "gb-great-britain_9100BARNES",
          "lat": 51.46685,
          "lon": -0.2409,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.017651941627264023
        },
        {
          "type": "STOP",
          "name": "New Eltham",
          "stopId": "gb-great-britain_9100NWELTHM",
          "lat": 51.43802,
          "lon": 0.07095,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01604330725967884
        },
        {
          "type": "STOP",
          "name": "New Cross",
          "stopId": "gb-great-britain_9100NWCRELLD",
          "lat": 51.47672,
          "lon": -0.03264,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02915547974407673
        },
        {
          "type": "STOP",
          "name": "New Cross",
          "stopId": "gb-great-britain_9100NWCROSSB",
          "lat": 51.47659,
          "lon": -0.03277,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02915547974407673
        },
        {
          "type": "STOP",
          "name": "New Beckenham",
          "stopId": "gb-great-britain_9100NBCKNHM",
          "lat": 51.41694,
          "lon": -0.03521,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.011962173506617546
        },
        {
          "type": "STOP",
          "name": "New Cross Gate",
          "stopId": "gb-great-britain_9100NEWXGTE5",
          "lat": 51.47591,
          "lon": -0.04093,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.034712955355644226
        },
        {
          "type": "STOP",
          "name": "New Cross Gate",
          "stopId": "gb-great-britain_9100NEWXGTE2",
          "lat": 51.47623,
          "lon": -0.04073,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.034712955355644226
        },
        {
          "type": "STOP",
          "name": "Northumberland Park London",
          "stopId": "gb-great-britain_9100NMBRLPK",
          "lat": 51.60191,
          "lon": -0.05387,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0097940843552351
        },
        {
          "type": "STOP",
          "name": "North Dulwich",
          "stopId": "gb-great-britain_9100NDULWCH",
          "lat": 51.45418,
          "lon": -0.08833,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012317918241024017
        },
        {
          "type": "STOP",
          "name": "Norwood Junction",
          "stopId": "gb-great-britain_9100NORWDJ1",
          "lat": 51.39777,
          "lon": -0.07462,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0381932407617569
        },
        {
          "type": "STOP",
          "name": "Norwood Junction",
          "stopId": "gb-great-britain_9100NORWDJ3",
          "lat": 51.39732,
          "lon": -0.07472,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0381932407617569
        },
        {
          "type": "STOP",
          "name": "Norwood Junction",
          "stopId": "gb-great-britain_9100NORWDJ4",
          "lat": 51.39726,
          "lon": -0.07461,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0381932407617569
        },
        {
          "type": "STOP",
          "name": "Norwood Junction",
          "stopId": "gb-great-britain_9100NORWDJ",
          "lat": 51.39718,
          "lon": -0.07445,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0381932407617569
        },
        {
          "type": "STOP",
          "name": "Norbury",
          "stopId": "gb-great-britain_9100NORBURY4",
          "lat": 51.41104,
          "lon": -0.1213,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.019162865355610847
        },
        {
          "type": "STOP",
          "name": "Norbury",
          "stopId": "gb-great-britain_490001209B",
          "lat": 51.41114,
          "lon": -0.12115,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.019162865355610847
        },
        {
          "type": "STOP",
          "name": "Norbury",
          "stopId": "gb-great-britain_9100NORBURY1",
          "lat": 51.41123,
          "lon": -0.12097,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.019162865355610847
        },
        {
          "type": "STOP",
          "name": "Mitcham Junction",
          "stopId": "gb-great-britain_9100MITCHMJ",
          "lat": 51.39292,
          "lon": -0.15744,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.013477453030645847
        },
        {
          "type": "STOP",
          "name": "New Southgate",
          "stopId": "gb-great-britain_9100NEWSGAT",
          "lat": 51.6138,
          "lon": -0.14281,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.009678345173597336
        },
        {
          "type": "STOP",
          "name": "New Malden",
          "stopId": "gb-great-britain_9100NEWMLDN",
          "lat": 51.40396,
          "lon": -0.25576,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.019944164901971817
        },
        {
          "type": "STOP",
          "name": "Norbiton",
          "stopId": "gb-great-britain_9100NRBITON",
          "lat": 51.41231,
          "lon": -0.28408,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013905702158808708
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN8",
          "lat": 51.37441,
          "lon": 0.0885,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN",
          "lat": 51.37431,
          "lon": 0.08855,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN6",
          "lat": 51.37426,
          "lon": 0.08844,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN5",
          "lat": 51.37392,
          "lon": 0.08867,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN4",
          "lat": 51.37394,
          "lon": 0.08848,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN1",
          "lat": 51.37433,
          "lon": 0.08787,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN2",
          "lat": 51.37376,
          "lon": 0.08837,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Orpington",
          "stopId": "gb-great-britain_9100ORPNGTN3",
          "lat": 51.37393,
          "lon": 0.08842,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0355675183236599
        },
        {
          "type": "STOP",
          "name": "Petts Wood",
          "stopId": "gb-great-britain_9100PETSWD",
          "lat": 51.38863,
          "lon": 0.07456,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.025821076706051826
        },
        {
          "type": "STOP",
          "name": "Peckham Rye",
          "stopId": "gb-great-britain_9100PCKHMRY4",
          "lat": 51.46996,
          "lon": -0.07008,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.037872761487960815
        },
        {
          "type": "STOP",
          "name": "Peckham Rye",
          "stopId": "gb-great-britain_9100PCKHMRY3",
          "lat": 51.46992,
          "lon": -0.07003,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.037872761487960815
        },
        {
          "type": "STOP",
          "name": "Peckham Rye",
          "stopId": "gb-great-britain_9100PKHMRYC2",
          "lat": 51.46949,
          "lon": -0.07054,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.037872761487960815
        },
        {
          "type": "STOP",
          "name": "Peckham Rye",
          "stopId": "gb-great-britain_9100PKHMRYC1",
          "lat": 51.46944,
          "lon": -0.07057,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.037872761487960815
        },
        {
          "type": "STOP",
          "name": "Penge West",
          "stopId": "gb-great-britain_9100PENEW2",
          "lat": 51.41736,
          "lon": -0.06064,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010958238504827023
        },
        {
          "type": "STOP",
          "name": "Penge West",
          "stopId": "gb-great-britain_9100PENEW1",
          "lat": 51.4174,
          "lon": -0.06087,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010958238504827023
        },
        {
          "type": "STOP",
          "name": "Penge East",
          "stopId": "gb-great-britain_9100PNGEE",
          "lat": 51.41932,
          "lon": -0.05414,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012115341611206532
        },
        {
          "type": "STOP",
          "name": "Old Street",
          "stopId": "gb-great-britain_9100OLDST",
          "lat": 51.52563,
          "lon": -0.08761,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.06524363905191422
        },
        {
          "type": "STOP",
          "name": "Palmers Green",
          "stopId": "gb-great-britain_9100PALMRSG",
          "lat": 51.61866,
          "lon": -0.11017,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.010035118088126183
        },
        {
          "type": "STOP",
          "name": "Oakleigh Park",
          "stopId": "gb-great-britain_9100OKLGHPK",
          "lat": 51.63767,
          "lon": -0.16623,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.009757841937243938
        },
        {
          "type": "STOP",
          "name": "Mottingham",
          "stopId": "gb-great-britain_9100MOTNGHM",
          "lat": 51.44025,
          "lon": 0.04996,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.015724213793873787
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX0",
          "lat": 51.53249,
          "lon": -0.12273,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX1",
          "lat": 51.53254,
          "lon": -0.12281,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX4",
          "lat": 51.53234,
          "lon": -0.12318,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX4F",
          "lat": 51.53251,
          "lon": -0.12328,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX6",
          "lat": 51.53243,
          "lon": -0.12339,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST1",
          "lat": 51.51891,
          "lon": -0.08201,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST",
          "lat": 51.51865,
          "lon": -0.08095,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST12",
          "lat": 51.51857,
          "lon": -0.08069,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST14",
          "lat": 51.51852,
          "lon": -0.08046,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST16",
          "lat": 51.51849,
          "lon": -0.08024,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST2",
          "lat": 51.51883,
          "lon": -0.08184,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST4",
          "lat": 51.51879,
          "lon": -0.08164,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST6",
          "lat": 51.51874,
          "lon": -0.08142,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Liverpool Street",
          "stopId": "gb-great-britain_9100LIVST8",
          "lat": 51.51869,
          "lon": -0.08117,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08424405008554459
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX10",
          "lat": 51.53299,
          "lon": -0.12397,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX8",
          "lat": 51.53242,
          "lon": -0.12359,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX7",
          "lat": 51.53247,
          "lon": -0.12344,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX3",
          "lat": 51.53228,
          "lon": -0.12303,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "London Kings Cross",
          "stopId": "gb-great-britain_9100KNGX9",
          "lat": 51.53307,
          "lon": -0.12377,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06894560158252716
        },
        {
          "type": "STOP",
          "name": "Moorgate",
          "stopId": "gb-great-britain_9100MRGT9",
          "lat": 51.51922,
          "lon": -0.08767,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.12452451139688492
        },
        {
          "type": "STOP",
          "name": "Moorgate",
          "stopId": "gb-great-britain_9100MRGT10",
          "lat": 51.51909,
          "lon": -0.08757,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.12452451139688492
        },
        {
          "type": "STOP",
          "name": "Mitcham Eastfields",
          "stopId": "gb-great-britain_9100ESTFLDS",
          "lat": 51.40739,
          "lon": -0.15487,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.012241742573678493
        },
        {
          "type": "STOP",
          "name": "Motspur Park",
          "stopId": "gb-great-britain_9100MOTSPRP",
          "lat": 51.39487,
          "lon": -0.23961,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013507231138646603
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON1",
          "lat": 51.51742,
          "lon": -0.17892,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON10",
          "lat": 51.51767,
          "lon": -0.17772,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON11",
          "lat": 51.51756,
          "lon": -0.17748,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON",
          "lat": 51.51775,
          "lon": -0.17749,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON",
          "lat": 51.51841,
          "lon": -0.17885,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON2",
          "lat": 51.51732,
          "lon": -0.17851,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON3",
          "lat": 51.51736,
          "lon": -0.17849,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON",
          "lat": 51.51745,
          "lon": -0.1784,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON5",
          "lat": 51.51744,
          "lon": -0.17834,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON6",
          "lat": 51.51746,
          "lon": -0.17814,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "London Paddington",
          "stopId": "gb-great-britain_9100PADTON8",
          "lat": 51.51747,
          "lon": -0.17784,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10096811503171921
        },
        {
          "type": "STOP",
          "name": "Mortlake",
          "stopId": "gb-great-britain_9100MRTLKE",
          "lat": 51.46806,
          "lon": -0.26737,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008908499032258987
        },
        {
          "type": "STOP",
          "name": "Bromley South",
          "stopId": "gb-great-britain_9100BROMLYS3",
          "lat": 51.40006,
          "lon": 0.01921,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03783297538757324
        },
        {
          "type": "STOP",
          "name": "Bromley South",
          "stopId": "gb-great-britain_9100BROMLYS2",
          "lat": 51.39997,
          "lon": 0.01924,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03783297538757324
        },
        {
          "type": "STOP",
          "name": "Bromley South",
          "stopId": "gb-great-britain_9100BROMLYS1",
          "lat": 51.39994,
          "lon": 0.01924,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03783297538757324
        },
        {
          "type": "STOP",
          "name": "Bromley South",
          "stopId": "gb-great-britain_9100BROMLYS4",
          "lat": 51.40008,
          "lon": 0.01927,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03783297538757324
        },
        {
          "type": "STOP",
          "name": "Bromley North",
          "stopId": "gb-great-britain_9100BROMLYN2",
          "lat": 51.40931,
          "lon": 0.01793,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009102416224777699
        },
        {
          "type": "STOP",
          "name": "Brockley",
          "stopId": "gb-great-britain_9100BROCKLY2",
          "lat": 51.46433,
          "lon": -0.03749,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Brockley",
          "stopId": "gb-great-britain_9100BROCKLY2",
          "lat": 51.46435,
          "lon": -0.03773,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Anerley",
          "stopId": "gb-great-britain_9100ANERLEY2",
          "lat": 51.41259,
          "lon": -0.06565,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010877898894250393
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN6",
          "lat": 51.52501,
          "lon": -0.16417,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN5",
          "lat": 51.52498,
          "lon": -0.16409,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN4",
          "lat": 51.5246,
          "lon": -0.16374,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN3",
          "lat": 51.5242,
          "lon": -0.16349,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN6",
          "lat": 51.52426,
          "lon": -0.16335,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "London Marylebone",
          "stopId": "gb-great-britain_9100MARYLBN1",
          "lat": 51.52421,
          "lon": -0.16327,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.023401569575071335
        },
        {
          "type": "STOP",
          "name": "Brixton",
          "stopId": "gb-great-britain_9400ZZLUBXN1",
          "lat": 51.46289,
          "lon": -0.11335,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08467040956020355
        },
        {
          "type": "STOP",
          "name": "Bickley",
          "stopId": "gb-great-britain_9100BICKLEY",
          "lat": 51.40006,
          "lon": 0.04434,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.01861206814646721
        },
        {
          "type": "STOP",
          "name": "Blackheath",
          "stopId": "gb-great-britain_9100BLKHTH",
          "lat": 51.4658,
          "lon": 0.00887,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024399125948548317
        },
        {
          "type": "STOP",
          "name": "Birkbeck",
          "stopId": "gb-great-britain_9100BIRKBCK",
          "lat": 51.40346,
          "lon": -0.05654,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00555142667144537
        },
        {
          "type": "STOP",
          "name": "Berrylands",
          "stopId": "gb-great-britain_9100BRLANDS",
          "lat": 51.39901,
          "lon": -0.28091,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.003957922570407391
        },
        {
          "type": "STOP",
          "name": "Harringay",
          "stopId": "gb-great-britain_9100HRGY2",
          "lat": 51.57735,
          "lon": -0.1054,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016293158754706383
        },
        {
          "type": "STOP",
          "name": "Harringay",
          "stopId": "gb-great-britain_9100HRGY1",
          "lat": 51.57738,
          "lon": -0.10512,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016293158754706383
        },
        {
          "type": "STOP",
          "name": "Charlton",
          "stopId": "gb-great-britain_9100CRLN2",
          "lat": 51.48676,
          "lon": 0.03053,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01888984628021717
        },
        {
          "type": "STOP",
          "name": "Charlton",
          "stopId": "gb-great-britain_9100CRLN1",
          "lat": 51.48668,
          "lon": 0.03068,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01888984628021717
        },
        {
          "type": "STOP",
          "name": "Kidbrooke",
          "stopId": "gb-great-britain_9100KIDBROK",
          "lat": 51.46203,
          "lon": 0.0279,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017180997878313065
        },
        {
          "type": "STOP",
          "name": "Lee",
          "stopId": "gb-great-britain_9100LEEE",
          "lat": 51.44969,
          "lon": 0.01437,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01594018191099167
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN4",
          "lat": 51.45122,
          "lon": -0.00012,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN4",
          "lat": 51.45135,
          "lon": -4e-05,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN2",
          "lat": 51.45116,
          "lon": -0.00031,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN4",
          "lat": 51.4511,
          "lon": -0.00045,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN6",
          "lat": 51.45181,
          "lon": 0.00012,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Hither Green",
          "stopId": "gb-great-britain_9100HTHRGRN5",
          "lat": 51.45149,
          "lon": 0.00058,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.026896627619862556
        },
        {
          "type": "STOP",
          "name": "Greenwich",
          "stopId": "gb-great-britain_9100GNWH",
          "lat": 51.47811,
          "lon": -0.01542,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.041653506457805634
        },
        {
          "type": "STOP",
          "name": "Lewisham",
          "stopId": "gb-great-britain_9100LEWISHM4",
          "lat": 51.46561,
          "lon": -0.01283,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07782349735498428
        },
        {
          "type": "STOP",
          "name": "Lewisham",
          "stopId": "gb-great-britain_9100LEWISHM3",
          "lat": 51.46548,
          "lon": -0.01269,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07782349735498428
        },
        {
          "type": "STOP",
          "name": "Lewisham",
          "stopId": "gb-great-britain_9100LEWISHM2",
          "lat": 51.46533,
          "lon": -0.01309,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.07782349735498428
        },
        {
          "type": "STOP",
          "name": "Lewisham",
          "stopId": "gb-great-britain_9100LEWISHM1",
          "lat": 51.46489,
          "lon": -0.01376,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.07782349735498428
        },
        {
          "type": "STOP",
          "name": "Ladywell",
          "stopId": "gb-great-britain_9100LDYW",
          "lat": 51.45602,
          "lon": -0.01919,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012640345841646194
        },
        {
          "type": "STOP",
          "name": "Lower Sydenham",
          "stopId": "gb-great-britain_9100LSYDNHM",
          "lat": 51.42474,
          "lon": -0.0333,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012118399143218994
        },
        {
          "type": "STOP",
          "name": "Catford Bridge",
          "stopId": "gb-great-britain_9100CATFBDG",
          "lat": 51.44459,
          "lon": -0.02492,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012294512242078781
        },
        {
          "type": "STOP",
          "name": "Lea Bridge",
          "stopId": "gb-great-britain_490011583W",
          "lat": 51.56675,
          "lon": -0.03712,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.012858078815042973
        },
        {
          "type": "STOP",
          "name": "Limehouse",
          "stopId": "gb-great-britain_9100LIMHSE2",
          "lat": 51.51254,
          "lon": -0.0398,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0845360979437828
        },
        {
          "type": "STOP",
          "name": "Kent House",
          "stopId": "gb-great-britain_9100KENTHOS2",
          "lat": 51.41222,
          "lon": -0.04525,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.012510847300291061
        },
        {
          "type": "STOP",
          "name": "Forest Hill",
          "stopId": "gb-great-britain_9100FORESTH2",
          "lat": 51.43926,
          "lon": -0.05292,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Forest Hill",
          "stopId": "gb-great-britain_9100FORESTH1",
          "lat": 51.43921,
          "lon": -0.05321,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Gipsy Hill",
          "stopId": "gb-great-britain_9100GIPSYH",
          "lat": 51.42453,
          "lon": -0.08404,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017001088708639145
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC14F",
          "lat": 51.50364,
          "lon": -0.08428,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC14",
          "lat": 51.50338,
          "lon": -0.08438,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC13",
          "lat": 51.50342,
          "lon": -0.08434,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC14F",
          "lat": 51.5035,
          "lon": -0.08425,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC10",
          "lat": 51.50367,
          "lon": -0.08424,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE1",
          "lat": 51.50471,
          "lon": -0.0842,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDC15",
          "lat": 51.50322,
          "lon": -0.08428,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE3",
          "lat": 51.50452,
          "lon": -0.08415,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE3",
          "lat": 51.50449,
          "lon": -0.08423,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE6",
          "lat": 51.50429,
          "lon": -0.08449,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE7",
          "lat": 51.50424,
          "lon": -0.08452,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE8",
          "lat": 51.50425,
          "lon": -0.08477,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "London Bridge",
          "stopId": "gb-great-britain_9100LNDNBDE9",
          "lat": 51.50426,
          "lon": -0.0849,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.2524751126766205
        },
        {
          "type": "STOP",
          "name": "East Dulwich",
          "stopId": "gb-great-britain_9100EDULWCH",
          "lat": 51.46104,
          "lon": -0.0808,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013252491131424904
        },
        {
          "type": "STOP",
          "name": "Highbury & Islington",
          "stopId": "gb-great-britain_9100HGHI4",
          "lat": 51.54715,
          "lon": -0.1036,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1320747584104538
        },
        {
          "type": "STOP",
          "name": "Highbury & Islington",
          "stopId": "gb-great-britain_9100HGHI6",
          "lat": 51.54715,
          "lon": -0.1033,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1320747584104538
        },
        {
          "type": "STOP",
          "name": "London Blackfriars",
          "stopId": "gb-great-britain_9100BLFR2",
          "lat": 51.50964,
          "lon": -0.10331,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.04299485310912132
        },
        {
          "type": "STOP",
          "name": "London Blackfriars",
          "stopId": "gb-great-britain_9100BLFR4",
          "lat": 51.50964,
          "lon": -0.10346,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.04299485310912132
        },
        {
          "type": "STOP",
          "name": "Essex Road",
          "stopId": "gb-great-britain_9100ESSEXRD",
          "lat": 51.54073,
          "lon": -0.09619,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02085186541080475
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPX4B",
          "lat": 51.53321,
          "lon": -0.12796,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPX4",
          "lat": 51.53326,
          "lon": -0.12787,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPADOM13",
          "lat": 51.53367,
          "lon": -0.12703,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPADOM12",
          "lat": 51.53362,
          "lon": -0.12717,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPADOM11",
          "lat": 51.53366,
          "lon": -0.12728,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "London St Pancras",
          "stopId": "gb-great-britain_9100STPX1",
          "lat": 51.53314,
          "lon": -0.12804,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06806938350200653
        },
        {
          "type": "STOP",
          "name": "Loughborough Junction",
          "stopId": "gb-great-britain_9100LBGHJN",
          "lat": 51.46626,
          "lon": -0.10216,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.00718699861317873
        },
        {
          "type": "STOP",
          "name": "Grove Park",
          "stopId": "gb-great-britain_9100GRVPK",
          "lat": 51.42995,
          "lon": 0.02314,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.020743045955896378
        },
        {
          "type": "STOP",
          "name": "Grove Park",
          "stopId": "gb-great-britain_9100GRVPK4",
          "lat": 51.43004,
          "lon": 0.02331,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.020743045955896378
        },
        {
          "type": "STOP",
          "name": "Grove Park",
          "stopId": "gb-great-britain_9100GRVPK1",
          "lat": 51.42974,
          "lon": 0.02322,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.020743045955896378
        },
        {
          "type": "STOP",
          "name": "Maze Hill",
          "stopId": "gb-great-britain_9100MAZEH",
          "lat": 51.48265,
          "lon": 0.00375,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.013322485610842705
        },
        {
          "type": "STOP",
          "name": "Elmstead Woods",
          "stopId": "gb-great-britain_9100ELMW",
          "lat": 51.4168,
          "lon": 0.04466,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012664265930652618
        },
        {
          "type": "STOP",
          "name": "Chislehurst",
          "stopId": "gb-great-britain_9100CHSLHRS4",
          "lat": 51.40568,
          "lon": 0.05733,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013270045630633831
        },
        {
          "type": "STOP",
          "name": "Chislehurst",
          "stopId": "gb-great-britain_9100CHSLHRS3",
          "lat": 51.40563,
          "lon": 0.05715,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013270045630633831
        },
        {
          "type": "STOP",
          "name": "Chislehurst",
          "stopId": "gb-great-britain_9100CHSLHRS4",
          "lat": 51.40565,
          "lon": 0.05721,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013270045630633831
        },
        {
          "type": "STOP",
          "name": "Eden Park",
          "stopId": "gb-great-britain_9100EDPK",
          "lat": 51.39018,
          "lon": -0.02637,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012599503621459007
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN1",
          "lat": 51.37656,
          "lon": -0.09294,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN2",
          "lat": 51.37654,
          "lon": -0.09287,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN3",
          "lat": 51.37654,
          "lon": -0.09263,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN4",
          "lat": 51.37656,
          "lon": -0.09256,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN5",
          "lat": 51.37661,
          "lon": -0.09238,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "East Croydon",
          "stopId": "gb-great-britain_9100ECROYDN6",
          "lat": 51.37653,
          "lon": -0.09233,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0845506340265274
        },
        {
          "type": "STOP",
          "name": "Falconwood",
          "stopId": "gb-great-britain_9100FALCNWD",
          "lat": 51.45923,
          "lon": 0.0793,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017382191494107246
        },
        {
          "type": "STOP",
          "name": "Crofton Park",
          "stopId": "gb-great-britain_9100CFPK",
          "lat": 51.45522,
          "lon": -0.03663,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.00815042108297348
        },
        {
          "type": "STOP",
          "name": "Clock House",
          "stopId": "gb-great-britain_9100CLOCKHS",
          "lat": 51.40834,
          "lon": -0.04082,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012986285611987114
        },
        {
          "type": "STOP",
          "name": "Earlsfield",
          "stopId": "gb-great-britain_9100ERLFLD",
          "lat": 51.4424,
          "lon": -0.18769,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.03979865834116936
        },
        {
          "type": "STOP",
          "name": "Crystal Palace",
          "stopId": "gb-great-britain_9100CRYSTLP3",
          "lat": 51.41747,
          "lon": -0.07115,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02719811350107193
        },
        {
          "type": "STOP",
          "name": "Crystal Palace",
          "stopId": "gb-great-britain_9100CRYSTLP2",
          "lat": 51.41723,
          "lon": -0.07211,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02719811350107193
        },
        {
          "type": "STOP",
          "name": "Crystal Palace",
          "stopId": "gb-great-britain_9100CRYSTLP6",
          "lat": 51.41764,
          "lon": -0.07114,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02719811350107193
        },
        {
          "type": "STOP",
          "name": "Crystal Palace",
          "stopId": "gb-great-britain_9100CRYSTLP1",
          "lat": 51.41714,
          "lon": -0.0722,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02719811350107193
        },
        {
          "type": "STOP",
          "name": "Hackbridge",
          "stopId": "gb-great-britain_9100HKBG",
          "lat": 51.37803,
          "lon": -0.15372,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.011921318247914314
        },
        {
          "type": "STOP",
          "name": "Kingston",
          "stopId": "gb-great-britain_9100KGSTON2",
          "lat": 51.4129,
          "lon": -0.30206,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013050546869635582
        },
        {
          "type": "STOP",
          "name": "Kingston",
          "stopId": "gb-great-britain_9100KGSTON3",
          "lat": 51.41297,
          "lon": -0.30167,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013050546869635582
        },
        {
          "type": "STOP",
          "name": "Hampton Court",
          "stopId": "gb-great-britain_9100HCRT2",
          "lat": 51.40126,
          "lon": -0.34233,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006898559629917145
        },
        {
          "type": "STOP",
          "name": "Hinchley Wood",
          "stopId": "gb-great-britain_9100HNCHLYW",
          "lat": 51.37504,
          "lon": -0.34062,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.006134735886007547
        },
        {
          "type": "STOP",
          "name": "Chiswick",
          "stopId": "gb-great-britain_9100CHISWCK",
          "lat": 51.48115,
          "lon": -0.26818,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009216126054525375
        },
        {
          "type": "STOP",
          "name": "Kew Bridge",
          "stopId": "gb-great-britain_9100KEWBDGE1",
          "lat": 51.48976,
          "lon": -0.2883,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009968774393200874
        },
        {
          "type": "STOP",
          "name": "Kew Bridge",
          "stopId": "gb-great-britain_9100KEWBDGE2",
          "lat": 51.48962,
          "lon": -0.28806,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009968774393200874
        },
        {
          "type": "STOP",
          "name": "Isleworth",
          "stopId": "gb-great-britain_9100ISLEWTH",
          "lat": 51.47488,
          "lon": -0.33689,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01036260649561882
        },
        {
          "type": "STOP",
          "name": "Castle Bar Park",
          "stopId": "gb-great-britain_9100CBARPAR",
          "lat": 51.52287,
          "lon": -0.3315,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.012906353920698166
        },
        {
          "type": "STOP",
          "name": "Harrow & Wealdstone",
          "stopId": "gb-great-britain_9100HROW6",
          "lat": 51.59236,
          "lon": -0.3347,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.038218941539525986
        },
        {
          "type": "STOP",
          "name": "Harrow & Wealdstone",
          "stopId": "gb-great-britain_9100HROW5",
          "lat": 51.5919,
          "lon": -0.334,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.038218941539525986
        },
        {
          "type": "STOP",
          "name": "Harrow & Wealdstone",
          "stopId": "gb-great-britain_9100HROW4",
          "lat": 51.59216,
          "lon": -0.33464,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.038218941539525986
        },
        {
          "type": "STOP",
          "name": "Harrow & Wealdstone",
          "stopId": "gb-great-britain_9100HROW3",
          "lat": 51.59177,
          "lon": -0.33406,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.038218941539525986
        },
        {
          "type": "STOP",
          "name": "Harrow-on-the-Hill",
          "stopId": "gb-great-britain_9100HAROOTH",
          "lat": 51.57914,
          "lon": -0.33609,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04911038652062416
        },
        {
          "type": "STOP",
          "name": "London Fenchurch Street",
          "stopId": "gb-great-britain_9100FENCHRS1",
          "lat": 51.51111,
          "lon": -0.07662,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02684592641890049
        },
        {
          "type": "STOP",
          "name": "London Fenchurch Street",
          "stopId": "gb-great-britain_9100FENCHRS3",
          "lat": 51.51122,
          "lon": -0.0766,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02684592641890049
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST7",
          "lat": 51.50987,
          "lon": -0.09126,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST6",
          "lat": 51.5099,
          "lon": -0.09121,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST5",
          "lat": 51.50986,
          "lon": -0.09109,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST4",
          "lat": 51.50993,
          "lon": -0.09102,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST3",
          "lat": 51.51,
          "lon": -0.09085,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Cannon Street",
          "stopId": "gb-great-britain_9100CANONST2",
          "lat": 51.50994,
          "lon": -0.09084,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.029352601617574692
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON1",
          "lat": 51.53023,
          "lon": -0.13459,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON10",
          "lat": 51.52936,
          "lon": -0.1351,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON11",
          "lat": 51.52912,
          "lon": -0.13486,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON12",
          "lat": 51.52934,
          "lon": -0.1354,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON13",
          "lat": 51.52943,
          "lon": -0.13559,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON14",
          "lat": 51.52942,
          "lon": -0.13574,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON15",
          "lat": 51.52948,
          "lon": -0.13591,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON16",
          "lat": 51.52921,
          "lon": -0.13603,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON2",
          "lat": 51.53013,
          "lon": -0.13469,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON3",
          "lat": 51.52989,
          "lon": -0.13464,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON4",
          "lat": 51.52957,
          "lon": -0.13442,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON5",
          "lat": 51.52973,
          "lon": -0.13473,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON6",
          "lat": 51.52961,
          "lon": -0.13479,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON7",
          "lat": 51.52947,
          "lon": -0.13468,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "London Euston",
          "stopId": "gb-great-britain_9100EUSTON8",
          "lat": 51.52925,
          "lon": -0.13464,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0994228795170784
        },
        {
          "type": "STOP",
          "name": "Denmark Hill",
          "stopId": "gb-great-britain_9100DENMRKH3",
          "lat": 51.46825,
          "lon": -0.08934,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.028553377836942673
        },
        {
          "type": "STOP",
          "name": "Denmark Hill",
          "stopId": "gb-great-britain_9100DENMRKH1",
          "lat": 51.46806,
          "lon": -0.08921,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.028553377836942673
        },
        {
          "type": "STOP",
          "name": "Denmark Hill",
          "stopId": "gb-great-britain_9100DENMRKH3",
          "lat": 51.46817,
          "lon": -0.08927,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.028553377836942673
        },
        {
          "type": "STOP",
          "name": "Denmark Hill",
          "stopId": "gb-great-britain_9100DENMRKH2",
          "lat": 51.46815,
          "lon": -0.08925,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.028553377836942673
        },
        {
          "type": "STOP",
          "name": "Kensington Olympia",
          "stopId": "gb-great-britain_9100KENOLYM3",
          "lat": 51.49767,
          "lon": -0.20963,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.018117113038897514
        },
        {
          "type": "STOP",
          "name": "Kensington Olympia",
          "stopId": "gb-great-britain_9100KENOLYM2",
          "lat": 51.49784,
          "lon": -0.21012,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.018117113038897514
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC17",
          "lat": 51.49366,
          "lon": -0.14614,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC19",
          "lat": 51.4937,
          "lon": -0.14636,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Charing Cross",
          "stopId": "gb-great-britain_9100CHRX6",
          "lat": 51.50726,
          "lon": -0.12364,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Charing Cross",
          "stopId": "gb-great-britain_9100CHRX4",
          "lat": 51.50734,
          "lon": -0.12337,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Charing Cross",
          "stopId": "gb-great-britain_9100CHRX3",
          "lat": 51.50738,
          "lon": -0.12335,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Charing Cross",
          "stopId": "gb-great-britain_9100CHRX2",
          "lat": 51.50731,
          "lon": -0.12299,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Charing Cross",
          "stopId": "gb-great-britain_9100CHRX1",
          "lat": 51.50737,
          "lon": -0.12303,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC16",
          "lat": 51.4937,
          "lon": -0.14594,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC15F",
          "lat": 51.49393,
          "lon": -0.1455,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC14",
          "lat": 51.49382,
          "lon": -0.14563,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC10",
          "lat": 51.49404,
          "lon": -0.14499,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC13",
          "lat": 51.49446,
          "lon": -0.14503,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC11",
          "lat": 51.49407,
          "lon": -0.14513,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC12",
          "lat": 51.49407,
          "lon": -0.14518,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE1",
          "lat": 51.49349,
          "lon": -0.14471,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE2",
          "lat": 51.49392,
          "lon": -0.14426,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIC17",
          "lat": 51.49435,
          "lon": -0.14393,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE4",
          "lat": 51.49436,
          "lon": -0.14396,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE5",
          "lat": 51.49429,
          "lon": -0.14418,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE7",
          "lat": 51.49436,
          "lon": -0.14433,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Victoria",
          "stopId": "gb-great-britain_9100VICTRIE8",
          "lat": 51.4942,
          "lon": -0.1446,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10580412298440933
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN7",
          "lat": 51.50202,
          "lon": -0.11314,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN6",
          "lat": 51.50197,
          "lon": -0.113,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN5",
          "lat": 51.50196,
          "lon": -0.11294,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN4",
          "lat": 51.50186,
          "lon": -0.11286,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN3",
          "lat": 51.50187,
          "lon": -0.11276,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN24",
          "lat": 51.50192,
          "lon": -0.11542,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN23",
          "lat": 51.50197,
          "lon": -0.11536,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN22",
          "lat": 51.50203,
          "lon": -0.11518,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN21",
          "lat": 51.50211,
          "lon": -0.11511,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN20",
          "lat": 51.5018,
          "lon": -0.11491,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN2",
          "lat": 51.50182,
          "lon": -0.11262,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN19",
          "lat": 51.50187,
          "lon": -0.11483,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN18",
          "lat": 51.50246,
          "lon": -0.11425,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN17",
          "lat": 51.50246,
          "lon": -0.11418,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN16",
          "lat": 51.5024,
          "lon": -0.11406,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN15",
          "lat": 51.50238,
          "lon": -0.114,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN14",
          "lat": 51.50229,
          "lon": -0.11392,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN13",
          "lat": 51.5023,
          "lon": -0.11383,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN12",
          "lat": 51.50224,
          "lon": -0.11364,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN10",
          "lat": 51.50216,
          "lon": -0.11338,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN9",
          "lat": 51.50213,
          "lon": -0.11332,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo",
          "stopId": "gb-great-britain_9100WATRLMN7",
          "lat": 51.50205,
          "lon": -0.11318,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11463122814893723
        },
        {
          "type": "STOP",
          "name": "London Waterloo East",
          "stopId": "gb-great-britain_9100WLOEB",
          "lat": 51.50417,
          "lon": -0.10825,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Waterloo East",
          "stopId": "gb-great-britain_9100WLOEB",
          "lat": 51.50423,
          "lon": -0.10819,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Waterloo East",
          "stopId": "gb-great-britain_9100WLOEA",
          "lat": 51.50427,
          "lon": -0.10874,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "London Waterloo East",
          "stopId": "gb-great-britain_9100WLOED",
          "lat": 51.50402,
          "lon": -0.10854,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05595735087990761
        },
        {
          "type": "STOP",
          "name": "Malden Manor",
          "stopId": "gb-great-britain_9100MALDENM",
          "lat": 51.38472,
          "lon": -0.26125,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.006703705992549658
        },
        {
          "type": "STOP",
          "name": "Woolwich Arsenal",
          "stopId": "gb-great-britain_9100WOLWCHA1",
          "lat": 51.48957,
          "lon": 0.07049,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05395219475030899
        },
        {
          "type": "STOP",
          "name": "Woolwich Arsenal",
          "stopId": "gb-great-britain_9100WOLWCHA2",
          "lat": 51.48967,
          "lon": 0.0706,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05395219475030899
        },
        {
          "type": "STOP",
          "name": "Westcombe Park",
          "stopId": "gb-great-britain_9100WCOMBEP",
          "lat": 51.48424,
          "lon": 0.01862,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.014521168544888496
        },
        {
          "type": "STOP",
          "name": "West Ham",
          "stopId": "gb-great-britain_9100WHAMHL",
          "lat": 51.5281,
          "lon": 0.00457,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.14679886400699615
        },
        {
          "type": "STOP",
          "name": "Stratford International",
          "stopId": "gb-great-britain_9100STFODOM2",
          "lat": 51.54476,
          "lon": -0.00901,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.030039748176932335
        },
        {
          "type": "STOP",
          "name": "Stratford International",
          "stopId": "gb-great-britain_9100STFODOM2",
          "lat": 51.54485,
          "lon": -0.00894,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.030039748176932335
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD12",
          "lat": 51.54317,
          "lon": -0.00333,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD11",
          "lat": 51.54315,
          "lon": -0.00313,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD10A",
          "lat": 51.54284,
          "lon": -0.00254,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD9",
          "lat": 51.54221,
          "lon": -0.00325,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD9",
          "lat": 51.5422,
          "lon": -0.00318,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD8",
          "lat": 51.54163,
          "lon": -0.00381,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Stratford",
          "stopId": "gb-great-britain_9100STFD5",
          "lat": 51.54146,
          "lon": -0.00375,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.2356184422969818
        },
        {
          "type": "STOP",
          "name": "Sundridge Park",
          "stopId": "gb-great-britain_9100SNDP",
          "lat": 51.41396,
          "lon": 0.02148,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0067489235661923885
        },
        {
          "type": "STOP",
          "name": "St Johns",
          "stopId": "gb-great-britain_9100STJOHNS",
          "lat": 51.46909,
          "lon": -0.02218,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01806989125907421
        },
        {
          "type": "STOP",
          "name": "West Wickham",
          "stopId": "gb-great-britain_9100WWICKHM",
          "lat": 51.38152,
          "lon": -0.01473,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.011894221417605877
        },
        {
          "type": "STOP",
          "name": "Woolwich Dockyard",
          "stopId": "gb-great-britain_9100WOLWCDY",
          "lat": 51.49109,
          "lon": 0.05488,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.014741485007107258
        },
        {
          "type": "STOP",
          "name": "Shortlands",
          "stopId": "gb-great-britain_9100SHRTLND4",
          "lat": 51.4058,
          "lon": 0.00178,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01902572251856327
        },
        {
          "type": "STOP",
          "name": "Tottenham Hale",
          "stopId": "gb-great-britain_9100TTNHMHL",
          "lat": 51.58812,
          "lon": -0.05994,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10751108080148697
        },
        {
          "type": "STOP",
          "name": "Tottenham Hale",
          "stopId": "gb-great-britain_9100TTNHMHL4",
          "lat": 51.58917,
          "lon": -0.05976,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.10751108080148697
        },
        {
          "type": "STOP",
          "name": "South Bermondsey",
          "stopId": "gb-great-britain_9100SBRMNDS1",
          "lat": 51.48814,
          "lon": -0.05468,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01158221811056137
        },
        {
          "type": "STOP",
          "name": "Winchmore Hill",
          "stopId": "gb-great-britain_9100WNMHILL",
          "lat": 51.63421,
          "lon": -0.10086,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009383132681250572
        },
        {
          "type": "STOP",
          "name": "Vauxhall",
          "stopId": "gb-great-britain_9100VAUXHLM",
          "lat": 51.48613,
          "lon": -0.12271,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.1363372653722763
        },
        {
          "type": "STOP",
          "name": "London St. Pancras Int.",
          "stopId": "nl-OpenOV_2993917",
          "lat": 51.53054,
          "lon": -0.12515,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.0020368376281112432
        },
        {
          "type": "STOP",
          "name": "West Brompton",
          "stopId": "gb-great-britain_9100WBRMPTN4",
          "lat": 51.48672,
          "lon": -0.19511,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.04704000800848007
        },
        {
          "type": "STOP",
          "name": "West Brompton",
          "stopId": "gb-great-britain_9100WBRMPTN3",
          "lat": 51.48674,
          "lon": -0.19492,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.04704000800848007
        },
        {
          "type": "STOP",
          "name": "Wembley Central",
          "stopId": "gb-great-britain_9100WMBY5",
          "lat": 51.55233,
          "lon": -0.29643,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02732127346098423
        },
        {
          "type": "STOP",
          "name": "Wembley Stadium",
          "stopId": "gb-great-britain_9100WEMBLSM2",
          "lat": 51.55418,
          "lon": -0.28521,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009033423848450184
        },
        {
          "type": "STOP",
          "name": "Wembley Stadium",
          "stopId": "gb-great-britain_9100WEMBLSM1",
          "lat": 51.55437,
          "lon": -0.28509,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009033423848450184
        },
        {
          "type": "STOP",
          "name": "Sydenham Hill",
          "stopId": "gb-great-britain_9100SYDNHMH",
          "lat": 51.43261,
          "lon": -0.08015,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.011518931947648525
        },
        {
          "type": "STOP",
          "name": "Sydenham",
          "stopId": "gb-great-britain_9100SYDENHM2",
          "lat": 51.4273,
          "lon": -0.05429,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Sydenham",
          "stopId": "gb-great-britain_9100SYDENHM2",
          "lat": 51.42792,
          "lon": -0.05425,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02755318582057953
        },
        {
          "type": "STOP",
          "name": "Streatham Hill",
          "stopId": "gb-great-britain_9100STRHILL2",
          "lat": 51.43837,
          "lon": -0.12766,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.012065498158335686
        },
        {
          "type": "STOP",
          "name": "Streatham Hill",
          "stopId": "gb-great-britain_9100STRHILL1",
          "lat": 51.4384,
          "lon": -0.12846,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.012065498158335686
        },
        {
          "type": "STOP",
          "name": "Streatham Common",
          "stopId": "gb-great-britain_9100STRHCOM4",
          "lat": 51.41885,
          "lon": -0.13611,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01914549432694912
        },
        {
          "type": "STOP",
          "name": "Streatham Common",
          "stopId": "gb-great-britain_9100STRHCOM3",
          "lat": 51.41884,
          "lon": -0.13619,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01914549432694912
        },
        {
          "type": "STOP",
          "name": "Streatham Common",
          "stopId": "gb-great-britain_9100STRHCOM1",
          "lat": 51.41885,
          "lon": -0.13594,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01914549432694912
        },
        {
          "type": "STOP",
          "name": "Worcester Park",
          "stopId": "gb-great-britain_9100WRCSTRP",
          "lat": 51.38143,
          "lon": -0.24496,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008412857539951801
        },
        {
          "type": "STOP",
          "name": "Wimbledon",
          "stopId": "gb-great-britain_9100WDON8",
          "lat": 51.42193,
          "lon": -0.20496,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08671391755342484
        },
        {
          "type": "STOP",
          "name": "Wimbledon",
          "stopId": "gb-great-britain_9100WDON7",
          "lat": 51.42187,
          "lon": -0.20514,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08671391755342484
        },
        {
          "type": "STOP",
          "name": "Wimbledon",
          "stopId": "gb-great-britain_9100WDON6",
          "lat": 51.42197,
          "lon": -0.2052,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08671391755342484
        },
        {
          "type": "STOP",
          "name": "Seven Sisters",
          "stopId": "gb-great-britain_9100SEVNSIS2",
          "lat": 51.58324,
          "lon": -0.07518,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08061514049768448
        },
        {
          "type": "STOP",
          "name": "Seven Sisters",
          "stopId": "gb-great-britain_9100SEVNSIS1",
          "lat": 51.5832,
          "lon": -0.07502,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08061514049768448
        },
        {
          "type": "STOP",
          "name": "Selhurst",
          "stopId": "gb-great-britain_9100SELHRST4",
          "lat": 51.39203,
          "lon": -0.08876,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01909484714269638
        },
        {
          "type": "STOP",
          "name": "Selhurst",
          "stopId": "gb-great-britain_9100SELHRST3",
          "lat": 51.3921,
          "lon": -0.0886,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01909484714269638
        },
        {
          "type": "STOP",
          "name": "Selhurst",
          "stopId": "gb-great-britain_9100SELHRST1",
          "lat": 51.39227,
          "lon": -0.08853,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01909484714269638
        },
        {
          "type": "STOP",
          "name": "West Croydon",
          "stopId": "gb-great-britain_9100WCROYDN4",
          "lat": 51.37935,
          "lon": -0.1016,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02975526452064514
        },
        {
          "type": "STOP",
          "name": "West Croydon",
          "stopId": "gb-great-britain_9100WCROYDN3",
          "lat": 51.37919,
          "lon": -0.10192,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02975526452064514
        },
        {
          "type": "STOP",
          "name": "West Croydon",
          "stopId": "gb-great-britain_9100WCROYDN1",
          "lat": 51.37952,
          "lon": -0.10176,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02975526452064514
        },
        {
          "type": "STOP",
          "name": "West Dulwich",
          "stopId": "gb-great-britain_9100WDULWCH",
          "lat": 51.44028,
          "lon": -0.09089,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.012132158502936363
        },
        {
          "type": "STOP",
          "name": "Tulse Hill",
          "stopId": "gb-great-britain_9100TULSEH4",
          "lat": 51.43981,
          "lon": -0.10483,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.022287918254733086
        },
        {
          "type": "STOP",
          "name": "Tulse Hill",
          "stopId": "gb-great-britain_9100TULSEH3",
          "lat": 51.43991,
          "lon": -0.10489,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.022287918254733086
        },
        {
          "type": "STOP",
          "name": "West Norwood",
          "stopId": "gb-great-britain_9100WNORWOD1",
          "lat": 51.43152,
          "lon": -0.10289,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.018609406426548958
        },
        {
          "type": "STOP",
          "name": "Streatham",
          "stopId": "gb-great-britain_9100STRETHM2",
          "lat": 51.42609,
          "lon": -0.13112,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.020422805100679398
        },
        {
          "type": "STOP",
          "name": "Streatham",
          "stopId": "gb-great-britain_9100STRETHM1",
          "lat": 51.42582,
          "lon": -0.13141,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.020422805100679398
        },
        {
          "type": "STOP",
          "name": "Wandsworth Common",
          "stopId": "gb-great-britain_9100WANDCMN4",
          "lat": 51.44587,
          "lon": -0.16338,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016134046018123627
        },
        {
          "type": "STOP",
          "name": "Wandsworth Common",
          "stopId": "gb-great-britain_9100WANDCMN3",
          "lat": 51.44608,
          "lon": -0.16342,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016134046018123627
        },
        {
          "type": "STOP",
          "name": "Wandsworth Common",
          "stopId": "gb-great-britain_9100WANDCMN1",
          "lat": 51.44601,
          "lon": -0.1634,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016134046018123627
        },
        {
          "type": "STOP",
          "name": "Wandsworth Town",
          "stopId": "gb-great-britain_9100WDWTOWN",
          "lat": 51.46096,
          "lon": -0.18825,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.016432013362646103
        },
        {
          "type": "STOP",
          "name": "Shepherd's Bush",
          "stopId": "gb-great-britain_9100SHPDSB2",
          "lat": 51.50634,
          "lon": -0.21831,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0713416337966919
        },
        {
          "type": "STOP",
          "name": "Shepherd's Bush",
          "stopId": "gb-great-britain_9100SHPDSB1",
          "lat": 51.50643,
          "lon": -0.21821,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0713416337966919
        },
        {
          "type": "STOP",
          "name": "Sudbury & Harrow Road",
          "stopId": "gb-great-britain_9100SDBRYHR",
          "lat": 51.55434,
          "lon": -0.31606,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0022851722314953804
        },
        {
          "type": "STOP",
          "name": "West Ealing",
          "stopId": "gb-great-britain_9100WEALING3",
          "lat": 51.51344,
          "lon": -0.32103,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.02835175022482872
        },
        {
          "type": "STOP",
          "name": "West Ealing",
          "stopId": "gb-great-britain_9100WEALING4",
          "lat": 51.51352,
          "lon": -0.32124,
          "modes": [
            "LONG_DISTANCE",
            "SUBURBAN"
          ],
          "importance": 0.02835175022482872
        },
        {
          "type": "STOP",
          "name": "West Ealing",
          "stopId": "gb-great-britain_9100WEALING5",
          "lat": 51.51349,
          "lon": -0.3219,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.02835175022482872
        },
        {
          "type": "STOP",
          "name": "Sudbury Hill Harrow",
          "stopId": "gb-great-britain_490001283N",
          "lat": 51.55855,
          "lon": -0.33618,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0026133463252335787
        },
        {
          "type": "STOP",
          "name": "Teddington",
          "stopId": "gb-great-britain_9100TEDNGTN",
          "lat": 51.42446,
          "lon": -0.33257,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01300581730902195
        },
        {
          "type": "STOP",
          "name": "Twickenham",
          "stopId": "gb-great-britain_9100TWCKNHM5",
          "lat": 51.45053,
          "lon": -0.32881,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02330627106130123
        },
        {
          "type": "STOP",
          "name": "Twickenham",
          "stopId": "gb-great-britain_9100TWCKNHM3",
          "lat": 51.45061,
          "lon": -0.32901,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02330627106130123
        },
        {
          "type": "STOP",
          "name": "St Margarets",
          "stopId": "gb-great-britain_9100STMGTS",
          "lat": 51.45515,
          "lon": -0.32022,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009558665566146374
        },
        {
          "type": "STOP",
          "name": "Strawberry Hill",
          "stopId": "gb-great-britain_9100STRWBYH1",
          "lat": 51.43897,
          "lon": -0.33936,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007722546346485615
        },
        {
          "type": "STOP",
          "name": "South Greenford",
          "stopId": "gb-great-britain_9100SGFORD",
          "lat": 51.5332,
          "lon": -0.33644,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.012985006906092167
        },
        {
          "type": "STOP",
          "name": "Syon Lane",
          "stopId": "gb-great-britain_9100SYONLA",
          "lat": 51.48181,
          "lon": -0.32478,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.010644574649631977
        },
        {
          "type": "STOP",
          "name": "Thornton Heath",
          "stopId": "gb-great-britain_9100THTH",
          "lat": 51.39895,
          "lon": -0.10052,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.019445346668362617
        },
        {
          "type": "STOP",
          "name": "Tolworth",
          "stopId": "gb-great-britain_9100TOLWTH",
          "lat": 51.37687,
          "lon": -0.27944,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.006280022673308849
        },
        {
          "type": "STOP",
          "name": "Surbiton",
          "stopId": "gb-great-britain_9100SURBITN3",
          "lat": 51.39234,
          "lon": -0.304,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03253495693206787
        },
        {
          "type": "STOP",
          "name": "Surbiton",
          "stopId": "gb-great-britain_9100SURBITNDF",
          "lat": 51.39244,
          "lon": -0.304,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03253495693206787
        },
        {
          "type": "STOP",
          "name": "Surbiton",
          "stopId": "gb-great-britain_9100SURBITN3",
          "lat": 51.39255,
          "lon": -0.30396,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03253495693206787
        },
        {
          "type": "STOP",
          "name": "Thames Ditton",
          "stopId": "gb-great-britain_9100TDITTON2",
          "lat": 51.38856,
          "lon": -0.33903,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0065725077874958515
        },
        {
          "type": "STOP",
          "name": "Thames Ditton",
          "stopId": "gb-great-britain_9100TDITTON1",
          "lat": 51.38869,
          "lon": -0.33894,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0065725077874958515
        }
      ]
    },
    "Paris": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Paris",
        "lat": 48.853406,
        "lon": 2.348414,
        "country": "FR"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Fontaine Michalon",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:486615",
          "lat": 48.74305,
          "lon": 2.29596,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00331509648822248
        },
        {
          "type": "STOP",
          "name": "Les Baconnets",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43228",
          "lat": 48.73985,
          "lon": 2.28811,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003997196443378925
        },
        {
          "type": "STOP",
          "name": "Parc de Sceaux",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43177",
          "lat": 48.76972,
          "lon": 2.30993,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003372293896973133
        },
        {
          "type": "STOP",
          "name": "Cité Universitaire",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:473843",
          "lat": 48.82151,
          "lon": 2.33886,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009763838723301888
        },
        {
          "type": "STOP",
          "name": "Port Royal",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44500",
          "lat": 48.84006,
          "lon": 2.33714,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009099820628762245
        },
        {
          "type": "STOP",
          "name": "Rungis la Fraternelle",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44787",
          "lat": 48.74022,
          "lon": 2.3522,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0014462403487414122
        },
        {
          "type": "STOP",
          "name": "Laplace",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43607",
          "lat": 48.80836,
          "lon": 2.33434,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007807512301951647
        },
        {
          "type": "STOP",
          "name": "Gare Montparnasse",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43238",
          "lat": 48.83841,
          "lon": 2.31639,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05308782681822777
        },
        {
          "type": "STOP",
          "name": "Gare Montparnasse",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:471918",
          "lat": 48.8392,
          "lon": 2.3173,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05308782681822777
        },
        {
          "type": "STOP",
          "name": "Fontenay-aux-Roses",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43125",
          "lat": 48.78757,
          "lon": 2.29291,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003095241729170084
        },
        {
          "type": "STOP",
          "name": "Sceaux",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:59206",
          "lat": 48.78131,
          "lon": 2.29793,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0028149872086942196
        },
        {
          "type": "STOP",
          "name": "Vanves - Malakoff",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43214",
          "lat": 48.81829,
          "lon": 2.29197,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003334654262289405
        },
        {
          "type": "STOP",
          "name": "Meudon",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43162",
          "lat": 48.81436,
          "lon": 2.24288,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0031095147132873535
        },
        {
          "type": "STOP",
          "name": "Meudon Val Fleury",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43163",
          "lat": 48.80755,
          "lon": 2.24094,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005042434670031071
        },
        {
          "type": "STOP",
          "name": "Saint-Cloud",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43196",
          "lat": 48.84606,
          "lon": 2.21763,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007929380051791668
        },
        {
          "type": "STOP",
          "name": "Luxembourg",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43833",
          "lat": 48.84543,
          "lon": 2.33981,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009277738630771637
        },
        {
          "type": "STOP",
          "name": "Pont du Garigliano - Hôpital Européen G. Pompidou",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58798",
          "lat": 48.83888,
          "lon": 2.27047,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005323282442986965
        },
        {
          "type": "STOP",
          "name": "Rosa Parks",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58498",
          "lat": 48.89646,
          "lon": 2.37372,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007826820015907288
        },
        {
          "type": "STOP",
          "name": "Groslay",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43133",
          "lat": 48.98436,
          "lon": 2.35352,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0029786063823848963
        },
        {
          "type": "STOP",
          "name": "Stade de France Saint-Denis",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43204",
          "lat": 48.9177,
          "lon": 2.35044,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005684219766408205
        },
        {
          "type": "STOP",
          "name": "Saint-Ouen",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43203",
          "lat": 48.90456,
          "lon": 2.32269,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01590103842318058
        },
        {
          "type": "STOP",
          "name": "La Barre Ormesson",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46470",
          "lat": 48.96629,
          "lon": 2.3167,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0037973872385919094
        },
        {
          "type": "STOP",
          "name": "Enghien-les-Bains",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43075",
          "lat": 48.97288,
          "lon": 2.30679,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004733726382255554
        },
        {
          "type": "STOP",
          "name": "Péreire Levallois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44314",
          "lat": 48.88603,
          "lon": 2.29923,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013315632939338684
        },
        {
          "type": "STOP",
          "name": "Ermont - Eaubonne",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47898",
          "lat": 48.9805,
          "lon": 2.27075,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.010965513065457344
        },
        {
          "type": "STOP",
          "name": "Nanterre-La-Folie",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:487011",
          "lat": 48.89758,
          "lon": 2.22657,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008136951364576817
        },
        {
          "type": "STOP",
          "name": "Puteaux",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43184",
          "lat": 48.88337,
          "lon": 2.23362,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005645051132887602
        },
        {
          "type": "STOP",
          "name": "Nanterre Université",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43170",
          "lat": 48.90113,
          "lon": 2.21354,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.010526107624173164
        },
        {
          "type": "STOP",
          "name": "Sartrouville",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43191",
          "lat": 48.93769,
          "lon": 2.15722,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008045541122555733
        },
        {
          "type": "STOP",
          "name": "Saint-Gratien",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43201",
          "lat": 48.96366,
          "lon": 2.28578,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003064376302063465
        },
        {
          "type": "STOP",
          "name": "Épinay-sur-Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43077",
          "lat": 48.95383,
          "lon": 2.30239,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034797238186001778
        },
        {
          "type": "STOP",
          "name": "Villiers-sur-Marne - Le Plessis-Trévise",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:484463",
          "lat": 48.82325,
          "lon": 2.54264,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004797895438969135
        },
        {
          "type": "STOP",
          "name": "Sucy - Bonneuil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58792",
          "lat": 48.77206,
          "lon": 2.5075,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005570404697209597
        },
        {
          "type": "STOP",
          "name": "Joinville-le-Pont",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43135",
          "lat": 48.8212,
          "lon": 2.46387,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005866065621376038
        },
        {
          "type": "STOP",
          "name": "Saint-Maur - Créteil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44801",
          "lat": 48.8062,
          "lon": 2.47291,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005526122637093067
        },
        {
          "type": "STOP",
          "name": "Fontenay-sous-Bois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47238",
          "lat": 48.84379,
          "lon": 2.46354,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005501899402588606
        },
        {
          "type": "STOP",
          "name": "Vincennes",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43224",
          "lat": 48.84735,
          "lon": 2.43258,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.011710424907505512
        },
        {
          "type": "STOP",
          "name": "Créteil Pompadour",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46286",
          "lat": 48.77126,
          "lon": 2.43532,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006540205329656601
        },
        {
          "type": "STOP",
          "name": "Le Vert de Maisons",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:464040",
          "lat": 48.78883,
          "lon": 2.43212,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006440439261496067
        },
        {
          "type": "STOP",
          "name": "Maisons-Alfort - Alfortville",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43154",
          "lat": 48.80218,
          "lon": 2.42644,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006955361925065517
        },
        {
          "type": "STOP",
          "name": "Nation",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:473875",
          "lat": 48.84823,
          "lon": 2.39594,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05381573736667633
        },
        {
          "type": "STOP",
          "name": "Gare de Lyon",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:470195",
          "lat": 48.8434,
          "lon": 2.37637,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04742710664868355
        },
        {
          "type": "STOP",
          "name": "Bercy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:479035",
          "lat": 48.83859,
          "lon": 2.38421,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02425447106361389
        },
        {
          "type": "STOP",
          "name": "Gare d'Austerlitz",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43072",
          "lat": 48.84032,
          "lon": 2.36782,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02844325266778469
        },
        {
          "type": "STOP",
          "name": "Gare d'Austerlitz",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:471077",
          "lat": 48.84014,
          "lon": 2.36698,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02844325266778469
        },
        {
          "type": "STOP",
          "name": "Saint-Michel Notre-Dame",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44877",
          "lat": 48.85302,
          "lon": 2.34496,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.030222201719880104
        },
        {
          "type": "STOP",
          "name": "Vitry-sur-Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46375",
          "lat": 48.80028,
          "lon": 2.40269,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002973980503156781
        },
        {
          "type": "STOP",
          "name": "Vauboyen",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43215",
          "lat": 48.75897,
          "lon": 2.19255,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.001982921501621604
        },
        {
          "type": "STOP",
          "name": "Petit Jouy Les Loges",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:57674",
          "lat": 48.77124,
          "lon": 2.14685,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0019999227952212095
        },
        {
          "type": "STOP",
          "name": "Jouy-en-Josas",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43136",
          "lat": 48.76476,
          "lon": 2.16445,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00210165255703032
        },
        {
          "type": "STOP",
          "name": "Igny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43083",
          "lat": 48.74085,
          "lon": 2.23081,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002029088092967868
        },
        {
          "type": "STOP",
          "name": "Porchefontaine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43183",
          "lat": 48.79654,
          "lon": 2.15223,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002866860246285796
        },
        {
          "type": "STOP",
          "name": "Les Vallées",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47969",
          "lat": 48.91365,
          "lon": 2.2572,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004559326451271772
        },
        {
          "type": "STOP",
          "name": "Le Stade",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43236",
          "lat": 48.93172,
          "lon": 2.26095,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034486670047044754
        },
        {
          "type": "STOP",
          "name": "La Garenne-Colombes",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47412",
          "lat": 48.90958,
          "lon": 2.23979,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004632391966879368
        },
        {
          "type": "STOP",
          "name": "La Défense",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:470549",
          "lat": 48.89223,
          "lon": 2.23842,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.042017724364995956
        },
        {
          "type": "STOP",
          "name": "Nanterre - Préfecture",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43169",
          "lat": 48.89588,
          "lon": 2.22299,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.011318635195493698
        },
        {
          "type": "STOP",
          "name": "Cormeilles-en-Parisis",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:5118",
          "lat": 48.96864,
          "lon": 2.19305,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003393525490537286
        },
        {
          "type": "STOP",
          "name": "La Frette - Montigny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43143",
          "lat": 48.97988,
          "lon": 2.18034,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002736663445830345
        },
        {
          "type": "STOP",
          "name": "Maisons-Laffitte",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:473109",
          "lat": 48.94574,
          "lon": 2.14467,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007207400165498257
        },
        {
          "type": "STOP",
          "name": "Parc des Expositions",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:426041",
          "lat": 48.97357,
          "lon": 2.51455,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004554266110062599
        },
        {
          "type": "STOP",
          "name": "Villepinte",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58793",
          "lat": 48.96257,
          "lon": 2.51278,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004270018078386784
        },
        {
          "type": "STOP",
          "name": "Épinay - Villetaneuse",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43078",
          "lat": 48.95793,
          "lon": 2.32876,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008209489285945892
        },
        {
          "type": "STOP",
          "name": "Sevran - Beaudottes",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43193",
          "lat": 48.947,
          "lon": 2.52473,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004562792833894491
        },
        {
          "type": "STOP",
          "name": "Sevran - Livry",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43194",
          "lat": 48.9364,
          "lon": 2.53529,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0037940661422908306
        },
        {
          "type": "STOP",
          "name": "Magenta",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58572",
          "lat": 48.88081,
          "lon": 2.3587,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008018853142857552
        },
        {
          "type": "STOP",
          "name": "Châtelet - Les Halles",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45102",
          "lat": 48.86174,
          "lon": 2.34698,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02580411545932293
        },
        {
          "type": "STOP",
          "name": "Gare Saint-Lazare",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:472013",
          "lat": 48.87774,
          "lon": 2.32463,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08480565249919891
        },
        {
          "type": "STOP",
          "name": "Invalides",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:470540",
          "lat": 48.86271,
          "lon": 2.31266,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.028873169794678688
        },
        {
          "type": "STOP",
          "name": "Clichy - Levallois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43112",
          "lat": 48.8975,
          "lon": 2.29747,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008280090056359768
        },
        {
          "type": "STOP",
          "name": "Les Grésillons",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43230",
          "lat": 48.92069,
          "lon": 2.3139,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0031195441260933876
        },
        {
          "type": "STOP",
          "name": "Neuilly - Porte Maillot",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:415093",
          "lat": 48.87835,
          "lon": 2.28422,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.025066543370485306
        },
        {
          "type": "STOP",
          "name": "Javel",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45346",
          "lat": 48.84716,
          "lon": 2.27804,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01194579154253006
        },
        {
          "type": "STOP",
          "name": "Colombes",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43113",
          "lat": 48.92396,
          "lon": 2.25932,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0036196664441376925
        },
        {
          "type": "STOP",
          "name": "Pont de l'Alma",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:415091",
          "lat": 48.86248,
          "lon": 2.30036,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007603051140904427
        },
        {
          "type": "STOP",
          "name": "Musée d'Orsay",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45705",
          "lat": 48.86037,
          "lon": 2.32662,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008478897623717785
        },
        {
          "type": "STOP",
          "name": "Courbevoie",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43118",
          "lat": 48.89862,
          "lon": 2.24919,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0036750321742147207
        },
        {
          "type": "STOP",
          "name": "Villeneuve Triage",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46304",
          "lat": 48.74461,
          "lon": 2.4387,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002963437233120203
        },
        {
          "type": "STOP",
          "name": "Villeneuve-le-Roi",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46307",
          "lat": 48.73969,
          "lon": 2.42642,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0028601917438209057
        },
        {
          "type": "STOP",
          "name": "Choisy-le-Roi",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43110",
          "lat": 48.76388,
          "lon": 2.41129,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006279719527810812
        },
        {
          "type": "STOP",
          "name": "Thiais - Orly (Pont de Rungis)",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47907",
          "lat": 48.74834,
          "lon": 2.37321,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0153734115883708
        },
        {
          "type": "STOP",
          "name": "Orly Ville",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46299",
          "lat": 48.74163,
          "lon": 2.40305,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002129289321601391
        },
        {
          "type": "STOP",
          "name": "Les Saules",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46298",
          "lat": 48.7452,
          "lon": 2.41745,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002708947751671076
        },
        {
          "type": "STOP",
          "name": "Villeneuve-Saint-Georges",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45067",
          "lat": 48.73008,
          "lon": 2.4463,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0073509737849235535
        },
        {
          "type": "STOP",
          "name": "Suresnes Mont Valérien",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43205",
          "lat": 48.87169,
          "lon": 2.22106,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005287356209009886
        },
        {
          "type": "STOP",
          "name": "Gare de Bellevue",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43088",
          "lat": 48.81887,
          "lon": 2.22996,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003207330359145999
        },
        {
          "type": "STOP",
          "name": "Sèvres Rive Gauche",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43195",
          "lat": 48.82121,
          "lon": 2.21508,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003139273263514042
        },
        {
          "type": "STOP",
          "name": "Sèvres - Ville-d'Avray",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47767",
          "lat": 48.82725,
          "lon": 2.20073,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004979477729648352
        },
        {
          "type": "STOP",
          "name": "Viroflay - Rive Droite",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46689",
          "lat": 48.80547,
          "lon": 2.16765,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0032805867958813906
        },
        {
          "type": "STOP",
          "name": "Viroflay Rive Gauche",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:462388",
          "lat": 48.80067,
          "lon": 2.17158,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008167915977537632
        },
        {
          "type": "STOP",
          "name": "Montreuil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43167",
          "lat": 48.80597,
          "lon": 2.15283,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003262327052652836
        },
        {
          "type": "STOP",
          "name": "Rueil-Malmaison",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58875",
          "lat": 48.88767,
          "lon": 2.17237,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00610792962834239
        },
        {
          "type": "STOP",
          "name": "Vaucresson",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43216",
          "lat": 48.83668,
          "lon": 2.15267,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0029919699300080538
        },
        {
          "type": "STOP",
          "name": "Porte de Clichy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44514",
          "lat": 48.89426,
          "lon": 2.31594,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02250143326818943
        },
        {
          "type": "STOP",
          "name": "Nanterre - Ville",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43171",
          "lat": 48.89502,
          "lon": 2.19512,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006157667376101017
        },
        {
          "type": "STOP",
          "name": "Drancy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43122",
          "lat": 48.93273,
          "lon": 2.45488,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00800201017409563
        },
        {
          "type": "STOP",
          "name": "Pantin",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43176",
          "lat": 48.89799,
          "lon": 2.40104,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007332891691476107
        },
        {
          "type": "STOP",
          "name": "Garges - Sarcelles",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:482426",
          "lat": 48.97633,
          "lon": 2.38995,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006205837242305279
        },
        {
          "type": "STOP",
          "name": "Pierrefitte - Stains",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43179",
          "lat": 48.96278,
          "lon": 2.37033,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0060066343285143375
        },
        {
          "type": "STOP",
          "name": "Noisy-le-Grand - Mont d'Est",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:474082",
          "lat": 48.84088,
          "lon": 2.54881,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006889716722071171
        },
        {
          "type": "STOP",
          "name": "Le Chénay Gagny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43127",
          "lat": 48.87716,
          "lon": 2.55277,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003215804696083069
        },
        {
          "type": "STOP",
          "name": "Gagny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43044",
          "lat": 48.88373,
          "lon": 2.5254,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003391179721802473
        },
        {
          "type": "STOP",
          "name": "La Varenne - Chennevières",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43146",
          "lat": 48.79533,
          "lon": 2.51323,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005225005559623241
        },
        {
          "type": "STOP",
          "name": "Nogent - Le Perreux",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46552",
          "lat": 48.83999,
          "lon": 2.49395,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0028965133242309093
        },
        {
          "type": "STOP",
          "name": "Neuilly-Plaisance",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43172",
          "lat": 48.85252,
          "lon": 2.51459,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006504648365080357
        },
        {
          "type": "STOP",
          "name": "Les Boullereaux Champigny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58267",
          "lat": 48.82486,
          "lon": 2.51199,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0027877064421772957
        },
        {
          "type": "STOP",
          "name": "Le Parc de Saint-Maur",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43234",
          "lat": 48.80541,
          "lon": 2.48662,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005131459794938564
        },
        {
          "type": "STOP",
          "name": "Noisy-le-Sec",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44201",
          "lat": 48.89666,
          "lon": 2.4592,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007386853918433189
        },
        {
          "type": "STOP",
          "name": "Nogent-sur-Marne",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47886",
          "lat": 48.83431,
          "lon": 2.47168,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005676971282809973
        },
        {
          "type": "STOP",
          "name": "Rosny Bois Perrier",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:42356",
          "lat": 48.88259,
          "lon": 2.48119,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013503000140190125
        },
        {
          "type": "STOP",
          "name": "Rosny-sous-Bois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47877",
          "lat": 48.87007,
          "lon": 2.48576,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002860033418983221
        },
        {
          "type": "STOP",
          "name": "Le Bourget",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43231",
          "lat": 48.93074,
          "lon": 2.42583,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008247010409832
        },
        {
          "type": "STOP",
          "name": "Gare de l'Est",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:470519",
          "lat": 48.87857,
          "lon": 2.3603,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03916289657354355
        },
        {
          "type": "STOP",
          "name": "La Plaine Stade de France",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43145",
          "lat": 48.91808,
          "lon": 2.36246,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008607328869402409
        },
        {
          "type": "STOP",
          "name": "Saint-Denis",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:412743",
          "lat": 48.93483,
          "lon": 2.34548,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013076424598693848
        },
        {
          "type": "STOP",
          "name": "Deuil - Montmagny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:473159",
          "lat": 48.97593,
          "lon": 2.33813,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030198569875210524
        },
        {
          "type": "STOP",
          "name": "Gennevilliers",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43130",
          "lat": 48.93282,
          "lon": 2.30798,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0032469602301716805
        },
        {
          "type": "STOP",
          "name": "Clamart",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43111",
          "lat": 48.81422,
          "lon": 2.27424,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003766824956983328
        },
        {
          "type": "STOP",
          "name": "La Croix de Berny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46007",
          "lat": 48.76172,
          "lon": 2.30421,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006763948127627373
        },
        {
          "type": "STOP",
          "name": "Val d'Argenteuil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43212",
          "lat": 48.95066,
          "lon": 2.23269,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003648265264928341
        },
        {
          "type": "STOP",
          "name": "Garches - Marnes-la-Coquette",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47770",
          "lat": 48.83825,
          "lon": 2.18709,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0029261005111038685
        },
        {
          "type": "STOP",
          "name": "Haussmann Saint-Lazare",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58718",
          "lat": 48.875,
          "lon": 2.32865,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08480565249919891
        },
        {
          "type": "STOP",
          "name": "Le Val d'Or",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:422065",
          "lat": 48.85625,
          "lon": 2.21655,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034287928137928247
        },
        {
          "type": "STOP",
          "name": "Denfert-Rochereau",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:473890",
          "lat": 48.83319,
          "lon": 2.33322,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03347748890519142
        },
        {
          "type": "STOP",
          "name": "Issy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43084",
          "lat": 48.81934,
          "lon": 2.25788,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005019450094550848
        },
        {
          "type": "STOP",
          "name": "Issy Val de Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:462357",
          "lat": 48.83051,
          "lon": 2.26401,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005498209502547979
        },
        {
          "type": "STOP",
          "name": "Gentilly",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45877",
          "lat": 48.81523,
          "lon": 2.34093,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007658904418349266
        },
        {
          "type": "STOP",
          "name": "Ivry-sur-Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46366",
          "lat": 48.81396,
          "lon": 2.39168,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030825238209217787
        },
        {
          "type": "STOP",
          "name": "Robinson",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43186",
          "lat": 48.78024,
          "lon": 2.28136,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003481865394860506
        },
        {
          "type": "STOP",
          "name": "Les Ardoines",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43227",
          "lat": 48.78249,
          "lon": 2.40959,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0051555512472987175
        },
        {
          "type": "STOP",
          "name": "Sannois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43189",
          "lat": 48.97088,
          "lon": 2.26382,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034643635153770447
        },
        {
          "type": "STOP",
          "name": "Massy - Verrières",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47940",
          "lat": 48.73496,
          "lon": 2.27398,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0045242044143378735
        },
        {
          "type": "STOP",
          "name": "Massy-Palaiseau",
          "stopId": "fr-base-de-donnees-multimodale-des-reseaux-de-transport-public-normands_FR:91377:ZE:StopPointxOCETGVxINOUIx87393579:ATOUMOD002",
          "lat": 48.72642,
          "lon": 2.25753,
          "modes": [
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.01139264926314354
        },
        {
          "type": "STOP",
          "name": "Massy - Palaiseau",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58774",
          "lat": 48.72552,
          "lon": 2.25877,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01139264926314354
        },
        {
          "type": "STOP",
          "name": "Val de Fontenay",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:492964",
          "lat": 48.85425,
          "lon": 2.48905,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.010786144994199276
        },
        {
          "type": "STOP",
          "name": "Gare Saint-Lazare",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58566",
          "lat": 48.87748,
          "lon": 2.32444,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08480565249919891
        },
        {
          "type": "STOP",
          "name": "Gare du Nord",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:462394",
          "lat": 48.88231,
          "lon": 2.35669,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04963996261358261
        },
        {
          "type": "STOP",
          "name": "Houilles - Carrières-sur-Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:27037",
          "lat": 48.92035,
          "lon": 2.18518,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009423460811376572
        },
        {
          "type": "STOP",
          "name": "Le Blanc-Mesnil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46163",
          "lat": 48.93231,
          "lon": 2.47539,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007915371097624302
        },
        {
          "type": "STOP",
          "name": "Le Raincy - Villemomble - Montfermeil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:27374",
          "lat": 48.88885,
          "lon": 2.51306,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034508153330534697
        },
        {
          "type": "STOP",
          "name": "La Courneuve - Aubervilliers",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43140",
          "lat": 48.9243,
          "lon": 2.38611,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008249317295849323
        },
        {
          "type": "STOP",
          "name": "Pont Cardinet",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:27476",
          "lat": 48.8884,
          "lon": 2.31295,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02107367105782032
        },
        {
          "type": "STOP",
          "name": "Paris Gare de Lyon",
          "stopId": "de-DELFI_000008700012",
          "lat": 48.84484,
          "lon": 2.37407,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.008661665953695774
        },
        {
          "type": "STOP",
          "name": "Paris Est",
          "stopId": "de-DELFI_000008700011",
          "lat": 48.87698,
          "lon": 2.35912,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.02634250931441784
        },
        {
          "type": "STOP",
          "name": "Paris-Est",
          "stopId": "be-sncb_8711300",
          "lat": 48.87737,
          "lon": 2.35893,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02634250931441784
        },
        {
          "type": "STOP",
          "name": "Paris Nord (FR)",
          "stopId": "be-sncb_8727100",
          "lat": 48.88011,
          "lon": 2.35458,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.027276884764432907
        },
        {
          "type": "STOP",
          "name": "Arcueil - Cachan",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43067",
          "lat": 48.7987,
          "lon": 2.32809,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0075951567851006985
        },
        {
          "type": "STOP",
          "name": "Aulnay-sous-Bois",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43071",
          "lat": 48.93215,
          "lon": 2.4956,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01071841735392809
        },
        {
          "type": "STOP",
          "name": "Bécon les Bruyères",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47923",
          "lat": 48.90549,
          "lon": 2.26879,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008114402182400227
        },
        {
          "type": "STOP",
          "name": "Bry-sur-Marne",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43101",
          "lat": 48.84514,
          "lon": 2.52567,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005663120187819004
        },
        {
          "type": "STOP",
          "name": "Boissy-Saint-Léger",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43094",
          "lat": 48.75227,
          "lon": 2.5045,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005401303060352802
        },
        {
          "type": "STOP",
          "name": "Bondy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43096",
          "lat": 48.89397,
          "lon": 2.47958,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0037879906594753265
        },
        {
          "type": "STOP",
          "name": "Ablon",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:46387",
          "lat": 48.72578,
          "lon": 2.41987,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0028915712609887123
        },
        {
          "type": "STOP",
          "name": "Bibliothèque François Mitterrand",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45301",
          "lat": 48.82888,
          "lon": 2.37776,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02297029457986355
        },
        {
          "type": "STOP",
          "name": "Auber",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:37115",
          "lat": 48.87235,
          "lon": 2.32966,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01192681398242712
        },
        {
          "type": "STOP",
          "name": "Gare de Paris Montparnasse Vaugirard",
          "stopId": "fr-breizhgo-ter_87391102",
          "lat": 48.84117,
          "lon": 2.32051,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00021547908545471728
        },
        {
          "type": "STOP",
          "name": "Gare de Paris Montparnasse Hall 1 - 2",
          "stopId": "fr-breizhgo-ter_87391003",
          "lat": 48.84117,
          "lon": 2.32051,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.05027948319911957
        },
        {
          "type": "STOP",
          "name": "Paris Montparnasse Hall 1 - 2",
          "stopId": "fr-base-de-donnees-multimodale-des-reseaux-de-transport-public-normands_FR:75115:ZE:StopPointxOCETrainxTERx87391003:ATOUMOD002",
          "lat": 48.84117,
          "lon": 2.32051,
          "modes": [
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL",
            "BUS"
          ],
          "importance": 0.05027948319911957
        },
        {
          "type": "STOP",
          "name": "Paris Montparnasse Vaugirard",
          "stopId": "fr-base-de-donnees-multimodale-des-reseaux-de-transport-public-normands_FR:75115:ZE:StopPointxOCETrainxTERx87391102:ATOUMOD002",
          "lat": 48.84117,
          "lon": 2.32051,
          "modes": [
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.00021547908545471728
        },
        {
          "type": "STOP",
          "name": "Bagneux",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:44493",
          "lat": 48.79334,
          "lon": 2.32201,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0075231590308249
        },
        {
          "type": "STOP",
          "name": "Boulainvilliers",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45453",
          "lat": 48.85698,
          "lon": 2.27481,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002872935961931944
        },
        {
          "type": "STOP",
          "name": "Avenue du Président Kennedy Maison de Radio France",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45419",
          "lat": 48.85353,
          "lon": 2.27968,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0028613251633942127
        },
        {
          "type": "STOP",
          "name": "Avenue Henri Martin",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45447",
          "lat": 48.86546,
          "lon": 2.27224,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003022282151505351
        },
        {
          "type": "STOP",
          "name": "Avenue Foch",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:45437",
          "lat": 48.86985,
          "lon": 2.27477,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002935655415058136
        },
        {
          "type": "STOP",
          "name": "Antony",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43066",
          "lat": 48.75463,
          "lon": 2.30089,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0069335768930613995
        },
        {
          "type": "STOP",
          "name": "Champ de Mars Tour Eiffel",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58757",
          "lat": 48.85648,
          "lon": 2.28966,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007665349170565605
        },
        {
          "type": "STOP",
          "name": "Chemin d'Antony",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:486573",
          "lat": 48.74794,
          "lon": 2.31265,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0012190185952931643
        },
        {
          "type": "STOP",
          "name": "Paris Saint-Lazare",
          "stopId": "fr-base-de-donnees-multimodale-des-reseaux-de-transport-public-normands_FR:75108:ZE:StopPointxOCETrainxTERx87384008:ATOUMOD002",
          "lat": 48.87624,
          "lon": 2.32533,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.08480565249919891
        },
        {
          "type": "STOP",
          "name": "Gare de Paris Saint-Lazare",
          "stopId": "fr-breizhgo-ter_87384008",
          "lat": 48.87624,
          "lon": 2.32533,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08480565249919891
        },
        {
          "type": "STOP",
          "name": "Asnières-sur-Seine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43069",
          "lat": 48.90588,
          "lon": 2.28321,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.011614454910159111
        },
        {
          "type": "STOP",
          "name": "Bois-Colombes",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:27277",
          "lat": 48.9142,
          "lon": 2.27165,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0034960987977683544
        },
        {
          "type": "STOP",
          "name": "Argenteuil",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47875",
          "lat": 48.9469,
          "lon": 2.25791,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007678501773625612
        },
        {
          "type": "STOP",
          "name": "Bièvres",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43091",
          "lat": 48.75087,
          "lon": 2.21616,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0020178859122097492
        },
        {
          "type": "STOP",
          "name": "Charles de Gaulle - Étoile",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58759",
          "lat": 48.87417,
          "lon": 2.29523,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04649956896901131
        },
        {
          "type": "STOP",
          "name": "Bourg-la-Reine",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43097",
          "lat": 48.78027,
          "lon": 2.31228,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00965418852865696
        },
        {
          "type": "STOP",
          "name": "Champ de Courses d'Enghien",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:14403",
          "lat": 48.97969,
          "lon": 2.29115,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00332744512706995
        },
        {
          "type": "STOP",
          "name": "Cernay",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:5250",
          "lat": 48.98515,
          "lon": 2.25702,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004964545834809542
        },
        {
          "type": "STOP",
          "name": "Champigny",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:58270",
          "lat": 48.80682,
          "lon": 2.51054,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00550475949421525
        },
        {
          "type": "STOP",
          "name": "Chaville - Vélizy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:47883",
          "lat": 48.79968,
          "lon": 2.18342,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0049528032541275024
        },
        {
          "type": "STOP",
          "name": "Chaville Rive Droite",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43241",
          "lat": 48.813,
          "lon": 2.18859,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005046335980296135
        },
        {
          "type": "STOP",
          "name": "Chaville Rive Gauche",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:43108",
          "lat": 48.80519,
          "lon": 2.18943,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003231659298762679
        },
        {
          "type": "STOP",
          "name": "Chatou - Croissy",
          "stopId": "fr-reseau-urbain-et-interurbain-dile-de-france-mobilites_IDFM:monomodalStopPlace:53783",
          "lat": 48.8852,
          "lon": 2.15594,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005144902504980564
        },
        {
          "type": "STOP",
          "name": "Paris Gare du Nord",
          "stopId": "eu-european-sleeper_8727103",
          "lat": 48.88099,
          "lon": 2.35698,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.022282976657152176
        },
        {
          "type": "STOP",
          "name": "Paris-Nord",
          "stopId": "nl-OpenOV_2993634",
          "lat": 48.88174,
          "lon": 2.35592,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.022282976657152176
        },
        {
          "type": "STOP",
          "name": "Paris Austerlitz",
          "stopId": "fr-horaires-sncf_FR::LMU:9558b3d0-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 48.84228,
          "lon": 2.36489,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.010419712401926517
        },
        {
          "type": "STOP",
          "name": "PARIS GARE DE LYON",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:870068600",
          "lat": 48.84361,
          "lon": 2.37444,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.008661665953695774
        },
        {
          "type": "STOP",
          "name": "Paris-Nord",
          "stopId": "fr-eurostar-gtfs-plan-de-transport-et-temps-reel_paris_nord",
          "lat": 48.88095,
          "lon": 2.35531,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.022282976657152176
        },
        {
          "type": "STOP",
          "name": "Paris-Gare-de-Lyon",
          "stopId": "fr-horaires-des-trains-trenitalia-france_10007",
          "lat": 48.84472,
          "lon": 2.37361,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.008661665953695774
        },
        {
          "type": "STOP",
          "name": "Paris Est",
          "stopId": "fr-horaires-sncf_FR::LMU:6cbbab30-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 48.87674,
          "lon": 2.35842,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.02634250931441784
        },
        {
          "type": "STOP",
          "name": "Paris Gare du Nord",
          "stopId": "eu-european-sleeper_8727103",
          "lat": 48.88014,
          "lon": 2.35485,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.027276884764432907
        },
        {
          "type": "STOP",
          "name": "Paris Gare de Lyon Hall 1 - 2",
          "stopId": "fr-horaires-sncf_FR::LMU:6451bcf0-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 48.84494,
          "lon": 2.37348,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.04260324686765671
        },
        {
          "type": "STOP",
          "name": "Paris Bercy Bourg. Pays d'Auv.",
          "stopId": "fr-horaires-sncf_FR::LMO:a2109f70-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 48.83922,
          "lon": 2.38279,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.005343815311789513
        },
        {
          "type": "STOP",
          "name": "Massy TGV",
          "stopId": "fr-horaires-sncf_FR::LMO:93375a70-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 48.72576,
          "lon": 2.26125,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.010437886230647564
        }
      ]
    },
    "Wien": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Wien",
        "lat": 48.208354,
        "lon": 16.372504,
        "country": "AT"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Wien HBF (AT)",
          "stopId": "be-sncb_8101003",
          "lat": 48.18459,
          "lon": 16.37901,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Meidling (AT)",
          "stopId": "be-sncb_8103107",
          "lat": 48.17484,
          "lon": 16.33623,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.00023524781863670796
        },
        {
          "type": "STOP",
          "name": "Flughafen Wien Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4708:0:2",
          "lat": 48.12055,
          "lon": 16.56399,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03102002665400505
        },
        {
          "type": "STOP",
          "name": "Flughafen Wien Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4708:0:2",
          "lat": 48.12055,
          "lon": 16.56399,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03102002665400505
        },
        {
          "type": "STOP",
          "name": "Flughafen Wien Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4708:0:1",
          "lat": 48.12022,
          "lon": 16.56443,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03102002665400505
        },
        {
          "type": "STOP",
          "name": "Flughafen Wien Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4708:0:4",
          "lat": 48.12016,
          "lon": 16.5643,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03102002665400505
        },
        {
          "type": "STOP",
          "name": "Wien Aspern Nord",
          "stopId": "sk-zsr_8102888",
          "lat": 48.23471,
          "lon": 16.50395,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.045662205666303635
        },
        {
          "type": "STOP",
          "name": "Wien Stadlau",
          "stopId": "sk-zsr_8104229",
          "lat": 48.21568,
          "lon": 16.44814,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003532011993229389
        },
        {
          "type": "STOP",
          "name": "Himberg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3734:0:1",
          "lat": 48.08138,
          "lon": 16.44544,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.001065534190274775
        },
        {
          "type": "STOP",
          "name": "Himberg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3734:0:3",
          "lat": 48.0814,
          "lon": 16.44552,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.001065534190274775
        },
        {
          "type": "STOP",
          "name": "Maria Lanzendorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4165:0:1",
          "lat": 48.10249,
          "lon": 16.41967,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003303353674709797
        },
        {
          "type": "STOP",
          "name": "Wien Simmering",
          "stopId": "sk-zsr_8101553",
          "lat": 48.17057,
          "lon": 16.41889,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.06541457027196884
        },
        {
          "type": "STOP",
          "name": "Wien Grillgasse",
          "stopId": "sk-zsr_8101556",
          "lat": 48.16876,
          "lon": 16.40614,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004068403504788876
        },
        {
          "type": "STOP",
          "name": "Wien Hbf",
          "stopId": "sk-zsr_8103000",
          "lat": 48.18597,
          "lon": 16.37833,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hbf",
          "stopId": "nl-OpenOV_2994154",
          "lat": 48.18499,
          "lon": 16.37795,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Achau Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3008:0:4",
          "lat": 48.08099,
          "lon": 16.37782,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0040822415612638
        },
        {
          "type": "STOP",
          "name": "Laxenburg-Biedermannsdorf Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4067:0:2",
          "lat": 48.0775,
          "lon": 16.35665,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003303353674709797
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "sk-zsr_8100514",
          "lat": 48.17585,
          "lon": 16.33586,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling Bahnhof",
          "stopId": "ua-ukrzaliznytsya_8100514",
          "lat": 48.17453,
          "lon": 16.33397,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Hennersdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3723:0:4",
          "lat": 48.11277,
          "lon": 16.35829,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.004179885610938072
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "ua-ukrzaliznytsya_8100003",
          "lat": 48.19675,
          "lon": 16.33726,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Mödling Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4239:0:1",
          "lat": 48.08629,
          "lon": 16.29525,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024686576798558235
        },
        {
          "type": "STOP",
          "name": "Mödling Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4239:0:13",
          "lat": 48.08636,
          "lon": 16.29554,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024686576798558235
        },
        {
          "type": "STOP",
          "name": "Mödling Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4239:0:14",
          "lat": 48.08633,
          "lon": 16.29545,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024686576798558235
        },
        {
          "type": "STOP",
          "name": "Mödling Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4239:0:15",
          "lat": 48.0863,
          "lon": 16.29533,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024686576798558235
        },
        {
          "type": "STOP",
          "name": "Brunn-Maria Enzersdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3255:0:3",
          "lat": 48.10552,
          "lon": 16.28809,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01332947053015232
        },
        {
          "type": "STOP",
          "name": "Brunn-Maria Enzersdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3255:0:1",
          "lat": 48.10552,
          "lon": 16.288,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01332947053015232
        },
        {
          "type": "STOP",
          "name": "Perchtoldsdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4500:0:3",
          "lat": 48.12266,
          "lon": 16.28559,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.013161608017981052
        },
        {
          "type": "STOP",
          "name": "Wien Mitte-Landstraße",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:743:0:1",
          "lat": 48.20731,
          "lon": 16.38548,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08579414337873459
        },
        {
          "type": "STOP",
          "name": "Lanzendorf-Rannersdorf",
          "stopId": "sk-zsr_8101173",
          "lat": 48.11413,
          "lon": 16.44742,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0055549852550029755
        },
        {
          "type": "STOP",
          "name": "Kledering b.Wien",
          "stopId": "sk-zsr_8101051",
          "lat": 48.13625,
          "lon": 16.43845,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 9.291300375480205e-05
        },
        {
          "type": "STOP",
          "name": "WIEN MEIDLING",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:810003107",
          "lat": 48.17472,
          "lon": 16.33611,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien HBF",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:810001003",
          "lat": 48.18509,
          "lon": 16.37705,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Gerasdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3499:0:3",
          "lat": 48.29386,
          "lon": 16.48404,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006333424709737301
        },
        {
          "type": "STOP",
          "name": "Deutsch-Wagram Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3279:0:5",
          "lat": 48.30299,
          "lon": 16.56372,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010577598586678505
        },
        {
          "type": "STOP",
          "name": "Deutsch-Wagram Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3279:0:4",
          "lat": 48.30294,
          "lon": 16.56374,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010577598586678505
        },
        {
          "type": "STOP",
          "name": "Kledering Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3895:0:1",
          "lat": 48.13361,
          "lon": 16.43885,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008877343498170376
        },
        {
          "type": "STOP",
          "name": "Kledering Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3895:0:4",
          "lat": 48.13363,
          "lon": 16.43892,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008877343498170376
        },
        {
          "type": "STOP",
          "name": "Kapellerfeld Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3852:0:1",
          "lat": 48.31691,
          "lon": 16.49515,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006202647928148508
        },
        {
          "type": "STOP",
          "name": "Kapellerfeld Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3852:0:1",
          "lat": 48.31692,
          "lon": 16.49508,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006202647928148508
        },
        {
          "type": "STOP",
          "name": "Klosterneuburg-Weidling Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3953:0:1",
          "lat": 48.29689,
          "lon": 16.33495,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008284663781523705
        },
        {
          "type": "STOP",
          "name": "Klosterneuburg-Weidling Bhf.",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:43:3953:0:5",
          "lat": 48.29695,
          "lon": 16.33504,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008284663781523705
        },
        {
          "type": "STOP",
          "name": "Bisamberg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3170:0:3",
          "lat": 48.31634,
          "lon": 16.34734,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008362091146409512
        },
        {
          "type": "STOP",
          "name": "Klosterneuburg-Kierling Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3952:0:1",
          "lat": 48.31006,
          "lon": 16.32601,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009839302860200405
        },
        {
          "type": "STOP",
          "name": "Klosterneuburg-Kierling Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3952:0:4",
          "lat": 48.3101,
          "lon": 16.3261,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009839302860200405
        },
        {
          "type": "STOP",
          "name": "Kritzendorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3995:0:1",
          "lat": 48.33584,
          "lon": 16.29902,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.00595484022051096
        },
        {
          "type": "STOP",
          "name": "Kritzendorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:3995:0:4",
          "lat": 48.33567,
          "lon": 16.2994,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.00595484022051096
        },
        {
          "type": "STOP",
          "name": "Schwechat Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4710:0:4",
          "lat": 48.14349,
          "lon": 16.48153,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.012945693917572498
        },
        {
          "type": "STOP",
          "name": "Schwechat Bahnhof",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:43:4710:0:1",
          "lat": 48.14355,
          "lon": 16.4816,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.012945693917572498
        },
        {
          "type": "STOP",
          "name": "Wien Aspern Nord",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:910:0:4",
          "lat": 48.23472,
          "lon": 16.50432,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045662205666303635
        },
        {
          "type": "STOP",
          "name": "Wien Aspern Nord",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:910:0:7",
          "lat": 48.23479,
          "lon": 16.50432,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045662205666303635
        },
        {
          "type": "STOP",
          "name": "Wien Erzherzog-Karl-Straße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:288:0:14",
          "lat": 48.23011,
          "lon": 16.45367,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.012114431709051132
        },
        {
          "type": "STOP",
          "name": "Wien Hirschstetten",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:532:0:1",
          "lat": 48.23269,
          "lon": 16.46911,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.010155009105801582
        },
        {
          "type": "STOP",
          "name": "Wien Kaiserebersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1780:0:3",
          "lat": 48.14595,
          "lon": 16.46507,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01281902939081192
        },
        {
          "type": "STOP",
          "name": "Wien Kaiserebersdorf",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1780:0:6",
          "lat": 48.14591,
          "lon": 16.46515,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01281902939081192
        },
        {
          "type": "STOP",
          "name": "Wien Leopoldau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:769:0:3",
          "lat": 48.27772,
          "lon": 16.44994,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05562208592891693
        },
        {
          "type": "STOP",
          "name": "Wien Leopoldau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:769:0:8",
          "lat": 48.27764,
          "lon": 16.44998,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05562208592891693
        },
        {
          "type": "STOP",
          "name": "Wien Stadlau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1299:0:5",
          "lat": 48.21869,
          "lon": 16.44812,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05392713472247124
        },
        {
          "type": "STOP",
          "name": "Wien Stadlau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1299:0:8",
          "lat": 48.21866,
          "lon": 16.44829,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.05392713472247124
        },
        {
          "type": "STOP",
          "name": "Wien Süßenbrunn",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1357:0:4",
          "lat": 48.28531,
          "lon": 16.48447,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.007148937322199345
        },
        {
          "type": "STOP",
          "name": "Wien Süßenbrunn",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1357:0:5",
          "lat": 48.28536,
          "lon": 16.48444,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.007148937322199345
        },
        {
          "type": "STOP",
          "name": "Wien Handelskai",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1705:0:8",
          "lat": 48.24216,
          "lon": 16.38606,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08190514147281647
        },
        {
          "type": "STOP",
          "name": "Wien Handelskai",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1705:0:7",
          "lat": 48.24195,
          "lon": 16.38532,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08190514147281647
        },
        {
          "type": "STOP",
          "name": "Wien Handelskai",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1705:0:2",
          "lat": 48.24202,
          "lon": 16.38523,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08190514147281647
        },
        {
          "type": "STOP",
          "name": "Wien Floridsdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:334:0:5",
          "lat": 48.25634,
          "lon": 16.40004,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07910359650850296
        },
        {
          "type": "STOP",
          "name": "Wien Floridsdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:334:0:24",
          "lat": 48.2563,
          "lon": 16.40017,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07910359650850296
        },
        {
          "type": "STOP",
          "name": "Wien Jedlersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:591:0:4",
          "lat": 48.27332,
          "lon": 16.39684,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009150784462690353
        },
        {
          "type": "STOP",
          "name": "Wien Brünner Straße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:176:0:4",
          "lat": 48.2679,
          "lon": 16.4034,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009221918880939484
        },
        {
          "type": "STOP",
          "name": "Wien Brünner Straße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:176:0:8",
          "lat": 48.26794,
          "lon": 16.40346,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009221918880939484
        },
        {
          "type": "STOP",
          "name": "Wien Floridsdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:334:0:20",
          "lat": 48.25642,
          "lon": 16.3998,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07910359650850296
        },
        {
          "type": "STOP",
          "name": "Wien Floridsdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:334:0:23",
          "lat": 48.25637,
          "lon": 16.39993,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07910359650850296
        },
        {
          "type": "STOP",
          "name": "Wien Siemensstraße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1248:0:3",
          "lat": 48.27099,
          "lon": 16.42076,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.013969529420137405
        },
        {
          "type": "STOP",
          "name": "Wien Siemensstraße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1248:0:7",
          "lat": 48.27092,
          "lon": 16.42083,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.013969529420137405
        },
        {
          "type": "STOP",
          "name": "Wien Strebersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1333:0:1",
          "lat": 48.28602,
          "lon": 16.3812,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008944240398705006
        },
        {
          "type": "STOP",
          "name": "Wien Strebersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1333:0:4",
          "lat": 48.28598,
          "lon": 16.38108,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008944240398705006
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:8",
          "lat": 48.17431,
          "lon": 16.33388,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:6",
          "lat": 48.17446,
          "lon": 16.33382,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:18",
          "lat": 48.17422,
          "lon": 16.33392,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:17",
          "lat": 48.17438,
          "lon": 16.33385,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:15",
          "lat": 48.17468,
          "lon": 16.33371,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:13",
          "lat": 48.17476,
          "lon": 16.33366,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1015:0:1",
          "lat": 48.17462,
          "lon": 16.33374,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN",
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE"
          ],
          "importance": 0.16373296082019806
        },
        {
          "type": "STOP",
          "name": "Wien Matzleinsdorfer Platz",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:849:0:5",
          "lat": 48.18023,
          "lon": 16.35791,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02626686729490757
        },
        {
          "type": "STOP",
          "name": "Wien Matzleinsdorfer Platz",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:849:0:13",
          "lat": 48.18013,
          "lon": 16.35796,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.02626686729490757
        },
        {
          "type": "STOP",
          "name": "Wien Blumental",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:582:0:2",
          "lat": 48.13932,
          "lon": 16.36939,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.004294504877179861
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:1",
          "lat": 48.19622,
          "lon": 16.3368,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:15",
          "lat": 48.19678,
          "lon": 16.33652,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:17",
          "lat": 48.19673,
          "lon": 16.33654,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:18",
          "lat": 48.19664,
          "lon": 16.33659,
          "modes": [
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:2",
          "lat": 48.19692,
          "lon": 16.33644,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:24",
          "lat": 48.1965,
          "lon": 16.33666,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:28",
          "lat": 48.19637,
          "lon": 16.33674,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:29",
          "lat": 48.19632,
          "lon": 16.33674,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Westbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1468:0:30",
          "lat": 48.19687,
          "lon": 16.33646,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.1250850260257721
        },
        {
          "type": "STOP",
          "name": "Wien Heiligenstadt",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:491:0:4",
          "lat": 48.24906,
          "lon": 16.3654,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07569458335638046
        },
        {
          "type": "STOP",
          "name": "Wien Heiligenstadt",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:491:0:2",
          "lat": 48.24903,
          "lon": 16.36552,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07569458335638046
        },
        {
          "type": "STOP",
          "name": "Wien Heiligenstadt",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:491:0:10",
          "lat": 48.24897,
          "lon": 16.36574,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.07569458335638046
        },
        {
          "type": "STOP",
          "name": "Wien Franz-Josefs-Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:345:0:5",
          "lat": 48.22712,
          "lon": 16.36072,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019545679911971092
        },
        {
          "type": "STOP",
          "name": "Wien Franz-Josefs-Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:345:0:15",
          "lat": 48.22679,
          "lon": 16.36123,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019545679911971092
        },
        {
          "type": "STOP",
          "name": "Wien Franz-Josefs-Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:345:0:14",
          "lat": 48.22678,
          "lon": 16.36112,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019545679911971092
        },
        {
          "type": "STOP",
          "name": "Wien Franz-Josefs-Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:345:0:13",
          "lat": 48.22677,
          "lon": 16.36104,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019545679911971092
        },
        {
          "type": "STOP",
          "name": "Wien Franz-Josefs-Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:345:0:12",
          "lat": 48.22674,
          "lon": 16.36092,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019545679911971092
        },
        {
          "type": "STOP",
          "name": "Wien Spittelau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1062:0:13",
          "lat": 48.23532,
          "lon": 16.35802,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.09911826252937317
        },
        {
          "type": "STOP",
          "name": "Wien Spittelau",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1062:0:7",
          "lat": 48.23532,
          "lon": 16.35811,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.09911826252937317
        },
        {
          "type": "STOP",
          "name": "Wien Hetzendorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:511:0:4",
          "lat": 48.16651,
          "lon": 16.31506,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01809339039027691
        },
        {
          "type": "STOP",
          "name": "Wien Liesing",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:788:0:8",
          "lat": 48.13468,
          "lon": 16.28408,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.031020021066069603
        },
        {
          "type": "STOP",
          "name": "Wien Liesing",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:788:0:13",
          "lat": 48.13468,
          "lon": 16.28429,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.031020021066069603
        },
        {
          "type": "STOP",
          "name": "Wien Atzgersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:94:0:8",
          "lat": 48.14704,
          "lon": 16.2885,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019256608560681343
        },
        {
          "type": "STOP",
          "name": "Wien Atzgersdorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:94:0:4",
          "lat": 48.14702,
          "lon": 16.28866,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.019256608560681343
        },
        {
          "type": "STOP",
          "name": "Wien Hetzendorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:511:0:8",
          "lat": 48.16657,
          "lon": 16.315,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01809339039027691
        },
        {
          "type": "STOP",
          "name": "Seyring Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4759:0:3",
          "lat": 48.33021,
          "lon": 16.50161,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006202647928148508
        },
        {
          "type": "STOP",
          "name": "Seyring Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4759:0:1",
          "lat": 48.33022,
          "lon": 16.50154,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006202647928148508
        },
        {
          "type": "STOP",
          "name": "Langenzersdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4045:0:3",
          "lat": 48.30638,
          "lon": 16.35614,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008681580424308777
        },
        {
          "type": "STOP",
          "name": "Langenzersdorf Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4045:0:3",
          "lat": 48.30635,
          "lon": 16.35608,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.008681580424308777
        },
        {
          "type": "STOP",
          "name": "St. Andrä-Wördern Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4824:0:3",
          "lat": 48.33417,
          "lon": 16.20948,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009088235907256603
        },
        {
          "type": "STOP",
          "name": "St. Andrä-Wördern Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4824:0:1",
          "lat": 48.3341,
          "lon": 16.20978,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.009088235907256603
        },
        {
          "type": "STOP",
          "name": "Zeiselmauer-Königstetten Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:5301:0:1",
          "lat": 48.32654,
          "lon": 16.17573,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.005334129091352224
        },
        {
          "type": "STOP",
          "name": "Zeiselmauer-Königstetten Bhf.",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:5301:0:3",
          "lat": 48.32661,
          "lon": 16.17574,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.005334129091352224
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:12",
          "lat": 48.18605,
          "lon": 16.37507,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1349:0:30",
          "lat": 48.18445,
          "lon": 16.37834,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:1",
          "lat": 48.18533,
          "lon": 16.37861,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Grillgasse",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1257:0:4",
          "lat": 48.16716,
          "lon": 16.40707,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.022378234192728996
        },
        {
          "type": "STOP",
          "name": "Wien Grillgasse",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1257:0:3",
          "lat": 48.16713,
          "lon": 16.40701,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.022378234192728996
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:27",
          "lat": 48.18487,
          "lon": 16.37845,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:28",
          "lat": 48.18473,
          "lon": 16.37842,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:29",
          "lat": 48.18507,
          "lon": 16.37853,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:31",
          "lat": 48.18496,
          "lon": 16.37848,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:32",
          "lat": 48.18515,
          "lon": 16.37856,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1349:0:30",
          "lat": 48.18597,
          "lon": 16.37515,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:4",
          "lat": 48.18464,
          "lon": 16.3784,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1349:0:9",
          "lat": 48.18454,
          "lon": 16.37837,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof Autoreisezug",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1350:0:1",
          "lat": 48.17806,
          "lon": 16.39105,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.0005601138691417873
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof Autoreisezug",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1350:0:2",
          "lat": 48.17807,
          "lon": 16.39107,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.0005601138691417873
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof Autoreisezug",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1350:0:4",
          "lat": 48.17798,
          "lon": 16.39092,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.0005601138691417873
        },
        {
          "type": "STOP",
          "name": "Wien Simmering",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1260:0:15",
          "lat": 48.16956,
          "lon": 16.41862,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06541457027196884
        },
        {
          "type": "STOP",
          "name": "Wien Simmering",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1260:0:2",
          "lat": 48.16949,
          "lon": 16.41872,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.06541457027196884
        },
        {
          "type": "STOP",
          "name": "Purkersdorf Zentrum Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4603:0:4",
          "lat": 48.20588,
          "lon": 16.17533,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.014034765772521496
        },
        {
          "type": "STOP",
          "name": "Purkersdorf Zentrum Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:43:4603:0:3",
          "lat": 48.20599,
          "lon": 16.17538,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.014034765772521496
        },
        {
          "type": "STOP",
          "name": "Wien Hütteldorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:560:0:10",
          "lat": 48.1975,
          "lon": 16.26094,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.08748287707567215
        },
        {
          "type": "STOP",
          "name": "Wien Hütteldorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:560:0:12",
          "lat": 48.19762,
          "lon": 16.26102,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08748287707567215
        },
        {
          "type": "STOP",
          "name": "Wien Hütteldorf",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:560:0:9",
          "lat": 48.19735,
          "lon": 16.26084,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08748287707567215
        },
        {
          "type": "STOP",
          "name": "Wien Hütteldorf",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:560:0:8",
          "lat": 48.19742,
          "lon": 16.2609,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.08748287707567215
        },
        {
          "type": "STOP",
          "name": "Wien Rennweg",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1091:0:5",
          "lat": 48.19525,
          "lon": 16.38601,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.005657229106873274
        },
        {
          "type": "STOP",
          "name": "Wien Praterstern",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1040:0:5",
          "lat": 48.21884,
          "lon": 16.39222,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10489444434642792
        },
        {
          "type": "STOP",
          "name": "Wien Praterstern",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:1040:0:17",
          "lat": 48.21884,
          "lon": 16.39245,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10489444434642792
        },
        {
          "type": "STOP",
          "name": "Wien Praterstern",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1040:0:20",
          "lat": 48.21883,
          "lon": 16.39211,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10489444434642792
        },
        {
          "type": "STOP",
          "name": "Wien Praterstern",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1040:0:19",
          "lat": 48.2188,
          "lon": 16.39182,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.10489444434642792
        },
        {
          "type": "STOP",
          "name": "Wien Mitte-Landstraße",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:743:0:5",
          "lat": 48.20563,
          "lon": 16.38443,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.08579414337873459
        },
        {
          "type": "STOP",
          "name": "Wien Mitte-Landstraße",
          "stopId": "at-PTA-Eastern-Region-Flex-2026_at:49:743:0:1",
          "lat": 48.20565,
          "lon": 16.38434,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08579414337873459
        },
        {
          "type": "STOP",
          "name": "Wien Rennweg",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1091:0:12",
          "lat": 48.19527,
          "lon": 16.38612,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.005657229106873274
        },
        {
          "type": "STOP",
          "name": "Wien Traisengasse",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1385:0:3",
          "lat": 48.23489,
          "lon": 16.38317,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0250153299421072
        },
        {
          "type": "STOP",
          "name": "Wien Traisengasse",
          "stopId": "at-Railway-Current-Reference-Data-2026_at:49:1385:0:8",
          "lat": 48.23495,
          "lon": 16.38331,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.0250153299421072
        },
        {
          "type": "STOP",
          "name": "Wien Flughafen",
          "stopId": "de-DELFI_at:43:4708",
          "lat": 48.12082,
          "lon": 16.56283,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.03102002665400505
        },
        {
          "type": "STOP",
          "name": "Wien Hauptbahnhof",
          "stopId": "de-DELFI_at:49:1349",
          "lat": 48.1851,
          "lon": 16.37711,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Hütteldorf",
          "stopId": "de-DELFI_at:49:560",
          "lat": 48.19726,
          "lon": 16.26125,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.08748287707567215
        },
        {
          "type": "STOP",
          "name": "Wien Hbf",
          "stopId": "nl-OpenOV_2994154",
          "lat": 48.18501,
          "lon": 16.37786,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.213316410779953
        },
        {
          "type": "STOP",
          "name": "Wien Meidling",
          "stopId": "nl-OpenOV_3541114",
          "lat": 48.17453,
          "lon": 16.33397,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.16373296082019806
        }
      ]
    },
    "Roma": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Roma",
        "lat": 41.89332,
        "lon": 12.482932,
        "country": "IT"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "TORRICOLA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008600",
          "lat": 41.8094,
          "lon": 12.55772,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005170839373022318
        },
        {
          "type": "STOP",
          "name": "FIERA DI ROMA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008415",
          "lat": 41.81015,
          "lon": 12.31951,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009745506569743156
        },
        {
          "type": "STOP",
          "name": "PONTE GALERIA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008403",
          "lat": 41.81824,
          "lon": 12.34474,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009954395703971386
        },
        {
          "type": "STOP",
          "name": "MURATELLA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008410",
          "lat": 41.82606,
          "lon": 12.4127,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009745506569743156
        },
        {
          "type": "STOP",
          "name": "MAGLIANA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008404",
          "lat": 41.83412,
          "lon": 12.43102,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00982392206788063
        },
        {
          "type": "STOP",
          "name": "VILLA BONELLI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008414",
          "lat": 41.85094,
          "lon": 12.45576,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00982392206788063
        },
        {
          "type": "STOP",
          "name": "CAPANNELLE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008672",
          "lat": 41.83057,
          "lon": 12.56889,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007693328429013491
        },
        {
          "type": "STOP",
          "name": "S.MARIA DELLE MOLE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008738",
          "lat": 41.77426,
          "lon": 12.60623,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.003273674286901951
        },
        {
          "type": "STOP",
          "name": "CASABIANCA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008730",
          "lat": 41.78818,
          "lon": 12.60431,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.002591653261333704
        },
        {
          "type": "STOP",
          "name": "ACQUA ACETOSA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008715",
          "lat": 41.79414,
          "lon": 12.61645,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002351819071918726
        },
        {
          "type": "STOP",
          "name": "SASSONE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008712",
          "lat": 41.78362,
          "lon": 12.62583,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002351819071918726
        },
        {
          "type": "STOP",
          "name": "PANTANELLA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008716",
          "lat": 41.77924,
          "lon": 12.63481,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002351819071918726
        },
        {
          "type": "STOP",
          "name": "MARINO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008701",
          "lat": 41.7688,
          "lon": 12.656,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002628581365570426
        },
        {
          "type": "STOP",
          "name": "ROMA MONTE MARIO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008322",
          "lat": 41.93897,
          "lon": 12.42174,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "ROMA S.FILIPPO NERI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008328",
          "lat": 41.95014,
          "lon": 12.41242,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "OTTAVIA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008321",
          "lat": 41.96086,
          "lon": 12.40947,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "IPOGEO DEGLI OTTAVI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008331",
          "lat": 41.96827,
          "lon": 12.40903,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "LA GIUSTINIANA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008330",
          "lat": 41.98513,
          "lon": 12.40347,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "LA STORTA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008320",
          "lat": 42.00163,
          "lon": 12.38126,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.010665766894817352
        },
        {
          "type": "STOP",
          "name": "OLGIATA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008333",
          "lat": 42.01527,
          "lon": 12.36387,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008478687144815922
        },
        {
          "type": "STOP",
          "name": "ROMA TERMINI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008409",
          "lat": 41.9005,
          "lon": 12.50203,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.11185356229543686
        },
        {
          "type": "STOP",
          "name": "ROMA TIBURTINA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008217",
          "lat": 41.91077,
          "lon": 12.53075,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.04832616075873375
        },
        {
          "type": "STOP",
          "name": "ROMA TUSCOLANA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008408",
          "lat": 41.87924,
          "lon": 12.52351,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.02145158313214779
        },
        {
          "type": "STOP",
          "name": "ROMA AURELIA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008025",
          "lat": 41.88332,
          "lon": 12.39528,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.004860285669565201
        },
        {
          "type": "STOP",
          "name": "ROMA OSTIENSE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008406",
          "lat": 41.87252,
          "lon": 12.48392,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.031236745417118073
        },
        {
          "type": "STOP",
          "name": "ROMA TRASTEVERE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008405",
          "lat": 41.87215,
          "lon": 12.46617,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.028702935203909874
        },
        {
          "type": "STOP",
          "name": "ROMA S.PIETRO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008323",
          "lat": 41.89602,
          "lon": 12.4545,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.020121807232499123
        },
        {
          "type": "STOP",
          "name": "GEMELLI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008329",
          "lat": 41.92769,
          "lon": 12.4278,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009581122547388077
        },
        {
          "type": "STOP",
          "name": "ROMA BALDUINA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008325",
          "lat": 41.91868,
          "lon": 12.43656,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00951666384935379
        },
        {
          "type": "STOP",
          "name": "APPIANO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008334",
          "lat": 41.90922,
          "lon": 12.43838,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009467900730669498
        },
        {
          "type": "STOP",
          "name": "VALLE AURELIA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008332",
          "lat": 41.89923,
          "lon": 12.44767,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012108883820474148
        },
        {
          "type": "STOP",
          "name": "QUATTRO VENTI",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008005",
          "lat": 41.87843,
          "lon": 12.45874,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009799356572329998
        },
        {
          "type": "STOP",
          "name": "Ponte di Nona",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830013705",
          "lat": 41.9188,
          "lon": 12.65422,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006544106639921665
        },
        {
          "type": "STOP",
          "name": "SETTE BAGNI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008216",
          "lat": 42.00631,
          "lon": 12.52016,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00960220955312252
        },
        {
          "type": "STOP",
          "name": "FIDENE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008225",
          "lat": 41.97964,
          "lon": 12.50846,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00974718015640974
        },
        {
          "type": "STOP",
          "name": "NUOVO SALARIO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008223",
          "lat": 41.95606,
          "lon": 12.51032,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00974718015640974
        },
        {
          "type": "STOP",
          "name": "ROMA NOMENTANA LL",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008224",
          "lat": 41.93323,
          "lon": 12.5225,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00974718015640974
        },
        {
          "type": "STOP",
          "name": "SALONE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008502",
          "lat": 41.9151,
          "lon": 12.63622,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0014352092985063791
        },
        {
          "type": "STOP",
          "name": "Val D`Ala",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008014",
          "lat": 41.94119,
          "lon": 12.51765,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0014352092985063791
        },
        {
          "type": "STOP",
          "name": "Roma, Stazione di Roma Tiburtina",
          "stopId": "at-Railway-Current-Reference-Data-2026_it:22079:stv1:1:1",
          "lat": 41.91111,
          "lon": 12.53119,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.000714968831744045
        },
        {
          "type": "STOP",
          "name": "CIAMPINO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830008650",
          "lat": 41.8043,
          "lon": 12.59956,
          "modes": [
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.012879217974841595
        },
        {
          "type": "STOP",
          "name": "ROMA PRENESTINA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008500",
          "lat": 41.89743,
          "lon": 12.54581,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005514814984053373
        },
        {
          "type": "STOP",
          "name": "VIGNA CLARA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830014570",
          "lat": 41.94936,
          "lon": 12.47097,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0014431168092414737
        },
        {
          "type": "STOP",
          "name": "Roma Tiburtina",
          "stopId": "de-DELFI_000008300262",
          "lat": 41.91107,
          "lon": 12.53146,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.04832616075873375
        },
        {
          "type": "STOP",
          "name": "Roma Ostiense",
          "stopId": "it-Toscana-Trenitalia_S08406_1",
          "lat": 41.87278,
          "lon": 12.48389,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.031236745417118073
        },
        {
          "type": "STOP",
          "name": "LA RUSTICA CITTA'",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008513",
          "lat": 41.90988,
          "lon": 12.60872,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0050008282996714115
        },
        {
          "type": "STOP",
          "name": "TOR SAPIENZA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008501",
          "lat": 41.90695,
          "lon": 12.59449,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004935591481626034
        },
        {
          "type": "STOP",
          "name": "SERENISSIMA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008514",
          "lat": 41.89993,
          "lon": 12.55783,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004765580408275127
        },
        {
          "type": "STOP",
          "name": "LA RUSTICA UIR",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008505",
          "lat": 41.9123,
          "lon": 12.62185,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0046726674772799015
        },
        {
          "type": "STOP",
          "name": "PALMIRO TOGLIATTI",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830008509",
          "lat": 41.90315,
          "lon": 12.57427,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0049092331901192665
        },
        {
          "type": "STOP",
          "name": "Roma Tuscolana",
          "stopId": "it-Toscana-Trenitalia_S08408_1",
          "lat": 41.87941,
          "lon": 12.5234,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.02145158313214779
        },
        {
          "type": "STOP",
          "name": "Roma Trastevere",
          "stopId": "it-Toscana-Trenitalia_S08405_1",
          "lat": 41.87237,
          "lon": 12.46614,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.028702935203909874
        },
        {
          "type": "STOP",
          "name": "Roma Tiburtina",
          "stopId": "it-Toscana-Trenitalia_S08217_1",
          "lat": 41.91086,
          "lon": 12.53069,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04832616075873375
        },
        {
          "type": "STOP",
          "name": "Roma Termini",
          "stopId": "it-Toscana-Trenitalia_S08409_1",
          "lat": 41.90054,
          "lon": 12.50188,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.11185356229543686
        },
        {
          "type": "STOP",
          "name": "Roma S.Pietro",
          "stopId": "it-Toscana-Trenitalia_S08323_1",
          "lat": 41.89625,
          "lon": 12.45456,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.020121807232499123
        }
      ]
    },
    "Firenze": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Firenze",
        "lat": 43.76956,
        "lon": 11.255814,
        "country": "IT"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Firenze Campo di Marte",
          "stopId": "de-DELFI_000008300180",
          "lat": 43.77757,
          "lon": 11.27659,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.00031300479895435274
        },
        {
          "type": "STOP",
          "name": "LASTRA A SIGNA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006001",
          "lat": 43.76978,
          "lon": 11.10287,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0039036639500409365
        },
        {
          "type": "STOP",
          "name": "PRATO CENTRALE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006416",
          "lat": 43.87872,
          "lon": 11.10925,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.015525894239544868
        },
        {
          "type": "STOP",
          "name": "SESTO FIORENTINO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006418",
          "lat": 43.83328,
          "lon": 11.19195,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016622202470898628
        },
        {
          "type": "STOP",
          "name": "FIESOLE CALDINE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006953",
          "lat": 43.83046,
          "lon": 11.30789,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005340850446373224
        },
        {
          "type": "STOP",
          "name": "IL CIONFO BINARIO LE CURE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006957",
          "lat": 43.78617,
          "lon": 11.26851,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0006088766967877746
        },
        {
          "type": "STOP",
          "name": "PIAN DEL MUGNONE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006952",
          "lat": 43.81807,
          "lon": 11.29543,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0005568190827034414
        },
        {
          "type": "STOP",
          "name": "FIRENZE BINARIO S.MARCO VECCHIO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006950",
          "lat": 43.79031,
          "lon": 11.2674,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0026213591918349266
        },
        {
          "type": "STOP",
          "name": "PONTASSIEVE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006904",
          "lat": 43.77392,
          "lon": 11.43791,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01658346876502037
        },
        {
          "type": "STOP",
          "name": "SIECI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006903",
          "lat": 43.79087,
          "lon": 11.39461,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0148226423189044
        },
        {
          "type": "STOP",
          "name": "FIRENZE CAMPO MARTE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006900",
          "lat": 43.77684,
          "lon": 11.27702,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.016060704365372658
        },
        {
          "type": "STOP",
          "name": "FIRENZE S.MARIA NOVELLA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006421",
          "lat": 43.77687,
          "lon": 11.24738,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.05891738831996918
        },
        {
          "type": "STOP",
          "name": "FIRENZE RIFREDI",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006420",
          "lat": 43.80085,
          "lon": 11.23574,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.038836315274238586
        },
        {
          "type": "STOP",
          "name": "Pontassieve",
          "stopId": "it-Toscana-Trenitalia_S06904_1",
          "lat": 43.77424,
          "lon": 11.43811,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01658346876502037
        },
        {
          "type": "STOP",
          "name": "Sieci",
          "stopId": "it-Toscana-Trenitalia_S06903_1",
          "lat": 43.79088,
          "lon": 11.39457,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0148226423189044
        },
        {
          "type": "STOP",
          "name": "Compiobbi",
          "stopId": "it-Toscana-Trenitalia_S06902_1",
          "lat": 43.78251,
          "lon": 11.35879,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009482397697865963
        },
        {
          "type": "STOP",
          "name": "COMPIOBBI",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006902",
          "lat": 43.7825,
          "lon": 11.3587,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009482397697865963
        },
        {
          "type": "STOP",
          "name": "Cionfo Binlecure",
          "stopId": "it-Toscana-Trenitalia_S06957_1",
          "lat": 43.78636,
          "lon": 11.26847,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0006589574622921646
        },
        {
          "type": "STOP",
          "name": "Fiesole Caldine",
          "stopId": "it-Toscana-Trenitalia_S06953_1",
          "lat": 43.83033,
          "lon": 11.30779,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005340850446373224
        },
        {
          "type": "STOP",
          "name": "Firenze C.M.",
          "stopId": "it-Toscana-Trenitalia_S06900_1",
          "lat": 43.77694,
          "lon": 11.27687,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.011566021479666233
        },
        {
          "type": "STOP",
          "name": "Montorsoli",
          "stopId": "it-Toscana-Trenitalia_S06601_1",
          "lat": 43.83574,
          "lon": 11.2829,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00017132893844973296
        },
        {
          "type": "STOP",
          "name": "Pian Del Mugnone",
          "stopId": "it-Toscana-Trenitalia_S06952_1",
          "lat": 43.81965,
          "lon": 11.29597,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.000564726535230875
        },
        {
          "type": "STOP",
          "name": "FIRENZE ROVEZZANO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006901",
          "lat": 43.76863,
          "lon": 11.30738,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00448750052601099
        },
        {
          "type": "STOP",
          "name": "Le Piagge",
          "stopId": "it-Toscana-Trenitalia_S06516_1",
          "lat": 43.78974,
          "lon": 11.17354,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00553590152412653
        },
        {
          "type": "STOP",
          "name": "LE PIAGGE",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006516",
          "lat": 43.78982,
          "lon": 11.17464,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00553590152412653
        },
        {
          "type": "STOP",
          "name": "S.DONNINO BADIA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006514",
          "lat": 43.78541,
          "lon": 11.14218,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002122502075508237
        },
        {
          "type": "STOP",
          "name": "Firenze Rifredi",
          "stopId": "it-Toscana-Trenitalia_S06420_1",
          "lat": 43.80016,
          "lon": 11.2364,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.038836315274238586
        },
        {
          "type": "STOP",
          "name": "Lastra A Signa",
          "stopId": "it-Toscana-Trenitalia_S06001_1",
          "lat": 43.76739,
          "lon": 11.10051,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003904322860762477
        },
        {
          "type": "STOP",
          "name": "Signa",
          "stopId": "it-Toscana-Trenitalia_S06513_1",
          "lat": 43.77553,
          "lon": 11.09573,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009164121001958847
        },
        {
          "type": "STOP",
          "name": "Firenze Rovezzano",
          "stopId": "it-Toscana-Trenitalia_S06901_1",
          "lat": 43.76904,
          "lon": 11.30936,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004429512191563845
        },
        {
          "type": "STOP",
          "name": "Firenze Smn",
          "stopId": "it-Toscana-Trenitalia_S06421_1",
          "lat": 43.77679,
          "lon": 11.24793,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.024496743455529213
        },
        {
          "type": "STOP",
          "name": "Calenzano",
          "stopId": "it-Toscana-Trenitalia_S06417_1",
          "lat": 43.85641,
          "lon": 11.14531,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006934868171811104
        },
        {
          "type": "STOP",
          "name": "Firenze Castello",
          "stopId": "it-Toscana-Trenitalia_S06419_1",
          "lat": 43.81973,
          "lon": 11.2188,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009003335610032082
        },
        {
          "type": "STOP",
          "name": "Sesto Fiorentino",
          "stopId": "it-Toscana-Trenitalia_S06418_1",
          "lat": 43.83345,
          "lon": 11.19178,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016622202470898628
        },
        {
          "type": "STOP",
          "name": "Zambra",
          "stopId": "it-Toscana-Trenitalia_S06425_1",
          "lat": 43.82608,
          "lon": 11.20571,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006606707349419594
        },
        {
          "type": "STOP",
          "name": "Firenze Statuto",
          "stopId": "it-Toscana-Trenitalia_S06430_1",
          "lat": 43.78744,
          "lon": 11.24996,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004361639264971018
        },
        {
          "type": "STOP",
          "name": "SIGNA",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006513",
          "lat": 43.77576,
          "lon": 11.09585,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009164121001958847
        },
        {
          "type": "STOP",
          "name": "Binario.S.M.V.",
          "stopId": "it-Toscana-Trenitalia_S06950_1",
          "lat": 43.79105,
          "lon": 11.26768,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0017607343615964055
        },
        {
          "type": "STOP",
          "name": "Pratignone",
          "stopId": "it-Toscana-Trenitalia_S06423_1",
          "lat": 43.84951,
          "lon": 11.16171,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006992197595536709
        },
        {
          "type": "STOP",
          "name": "Prato C.Le",
          "stopId": "it-Toscana-Trenitalia_S06416_1",
          "lat": 43.87872,
          "lon": 11.10929,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009353901259601116
        },
        {
          "type": "STOP",
          "name": "Prato P.Serragl.",
          "stopId": "it-Toscana-Trenitalia_S06422_1",
          "lat": 43.88451,
          "lon": 11.09836,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.005518768914043903
        },
        {
          "type": "STOP",
          "name": "S.Donnino Badia",
          "stopId": "it-Toscana-Trenitalia_S06514_1",
          "lat": 43.7855,
          "lon": 11.1418,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002122502075508237
        },
        {
          "type": "STOP",
          "name": "Prato Borgonuovo",
          "stopId": "it-Toscana-Trenitalia_S06426_1",
          "lat": 43.89148,
          "lon": 11.07506,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004826204385608435
        },
        {
          "type": "STOP",
          "name": "Il Neto",
          "stopId": "it-Toscana-Trenitalia_S06424_1",
          "lat": 43.83979,
          "lon": 11.18304,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0071450755931437016
        },
        {
          "type": "STOP",
          "name": "PRATO BORGONUOVO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006426",
          "lat": 43.89145,
          "lon": 11.07512,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004826204385608435
        },
        {
          "type": "STOP",
          "name": "FIRENZE STATUTO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006430",
          "lat": 43.78726,
          "lon": 11.24974,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004361639264971018
        },
        {
          "type": "STOP",
          "name": "FIRENZE CASTELLO",
          "stopId": "it-trenitalia_IT::Quay:otherTRENITALIA:830006419",
          "lat": 43.81943,
          "lon": 11.21838,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.009003335610032082
        },
        {
          "type": "STOP",
          "name": "ZAMBRA",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006425",
          "lat": 43.82584,
          "lon": 11.20621,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006606707349419594
        },
        {
          "type": "STOP",
          "name": "IL NETO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006424",
          "lat": 43.83961,
          "lon": 11.18267,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0071450755931437016
        },
        {
          "type": "STOP",
          "name": "PRATIGNONE",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006423",
          "lat": 43.84926,
          "lon": 11.16201,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006992197595536709
        },
        {
          "type": "STOP",
          "name": "CALENZANO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006417",
          "lat": 43.85642,
          "lon": 11.14537,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.006934868171811104
        },
        {
          "type": "STOP",
          "name": "PRATO PORTA AL SERRAGLIO",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:830006422",
          "lat": 43.88462,
          "lon": 11.09739,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007996449247002602
        }
      ]
    },
    "Hamburg": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Hamburg",
        "lat": 53.550341,
        "lon": 10.000654,
        "country": "DE"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Pinneberg",
          "stopId": "de-DELFI_de:01056:99951",
          "lat": 53.65518,
          "lon": 9.79761,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.024256421253085136
        },
        {
          "type": "STOP",
          "name": "Bergedorf",
          "stopId": "de-DELFI_de:02000:25950_G_G",
          "lat": 53.48994,
          "lon": 10.20594,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.031968940049409866
        },
        {
          "type": "STOP",
          "name": "Bergedorf",
          "stopId": "de-DELFI_de:02000:25950",
          "lat": 53.48983,
          "lon": 10.20617,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.031968940049409866
        },
        {
          "type": "STOP",
          "name": "Eidelstedt",
          "stopId": "de-DELFI_de:02000:84960",
          "lat": 53.59589,
          "lon": 9.9071,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.040288396179676056
        },
        {
          "type": "STOP",
          "name": "Eidelstedt Zentrum",
          "stopId": "de-DELFI_de:02000:83960",
          "lat": 53.61037,
          "lon": 9.90152,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009637911804020405
        },
        {
          "type": "STOP",
          "name": "Hamburg Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1",
          "lat": 53.55248,
          "lon": 10.00809,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:80953:1:5",
          "lat": 53.55309,
          "lon": 9.9347,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:10950:3:11",
          "lat": 53.55228,
          "lon": 10.00676,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:10950:1:5",
          "lat": 53.55238,
          "lon": 10.00749,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg",
          "stopId": "be-sncb_8001135",
          "lat": 53.4563,
          "lon": 9.9918,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Harburg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:49950:1:1",
          "lat": 53.45555,
          "lon": 9.99243,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Harburg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:49950:2:3",
          "lat": 53.45552,
          "lon": 9.99213,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Harburg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:49950:2:4",
          "lat": 53.45546,
          "lon": 9.99161,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Harburg Bahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:49950:3:5",
          "lat": 53.45545,
          "lon": 9.99152,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Altona",
          "stopId": "de-DELFI_de:02000:8002553",
          "lat": 53.5527,
          "lon": 9.93517,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.08735550940036774
        },
        {
          "type": "STOP",
          "name": "Hamburg Hauptbahnhof",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:10950:4:14",
          "lat": 53.55222,
          "lon": 10.00628,
          "modes": [
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:80953:3:9",
          "lat": 53.55307,
          "lon": 9.93523,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:80953:1:6",
          "lat": 53.55308,
          "lon": 9.93489,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:80953:3:10",
          "lat": 53.55307,
          "lon": 9.9354,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "at-Railway-Current-Reference-Data-2026_de:02000:80953:4:11",
          "lat": 53.55307,
          "lon": 9.93547,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "ch-opentransportdataswiss26_8001093",
          "lat": 53.5526,
          "lon": 9.9348,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Tonndorf",
          "stopId": "de-DELFI_de:02000:8006197",
          "lat": 53.58638,
          "lon": 10.12305,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007985246367752552
        },
        {
          "type": "STOP",
          "name": "Hamburg Hbf",
          "stopId": "de-DELFI_de:02000:10950",
          "lat": 53.55273,
          "lon": 10.00691,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg Hbf",
          "stopId": "de-DELFI_de:02000:10950_G_G",
          "lat": 53.55299,
          "lon": 10.00664,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Rahlstedt",
          "stopId": "de-DELFI_de:02000:8002558",
          "lat": 53.60486,
          "lon": 10.1544,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007985246367752552
        },
        {
          "type": "STOP",
          "name": "Hasselbrook",
          "stopId": "de-DELFI_de:02000:60950",
          "lat": 53.56471,
          "lon": 10.05613,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.040933381766080856
        },
        {
          "type": "STOP",
          "name": "Hamburg Dammtor",
          "stopId": "de-DELFI_de:02000:8002548",
          "lat": 53.56075,
          "lon": 9.98957,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.059047531336545944
        },
        {
          "type": "STOP",
          "name": "Harburg",
          "stopId": "de-DELFI_de:02000:49950_G",
          "lat": 53.45613,
          "lon": 9.99114,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.02930423431098461
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg",
          "stopId": "de-DELFI_de:02000:8000147_G",
          "lat": 53.45622,
          "lon": 9.99165,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg",
          "stopId": "de-DELFI_de:02000:8000147",
          "lat": 53.45591,
          "lon": 9.9917,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hörgensweg",
          "stopId": "de-DELFI_de:02000:86962",
          "lat": 53.61728,
          "lon": 9.90363,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009637911804020405
        },
        {
          "type": "STOP",
          "name": "Meckelfeld",
          "stopId": "de-DELFI_de:03353:8003929",
          "lat": 53.42438,
          "lon": 10.02971,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0042235879227519035
        },
        {
          "type": "STOP",
          "name": "Neugraben",
          "stopId": "de-DELFI_de:02000:41951",
          "lat": 53.47414,
          "lon": 9.85205,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.03013884276151657
        },
        {
          "type": "STOP",
          "name": "Schnelsen",
          "stopId": "de-DELFI_de:02000:86961",
          "lat": 53.63413,
          "lon": 9.90662,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009637911804020405
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg",
          "stopId": "se-Trafiklab_800020401",
          "lat": 53.4558,
          "lon": 9.9917,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Hbf",
          "stopId": "sk-zsr_8002549",
          "lat": 53.55367,
          "lon": 10.00673,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "sk-zsr_8002553",
          "lat": 53.55436,
          "lon": 9.93518,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.00016968154523056
        },
        {
          "type": "STOP",
          "name": "Hamburg Hauptbahnhof",
          "stopId": "no-Entur_NSR:Quay:111100",
          "lat": 53.5532,
          "lon": 10.0065,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg",
          "stopId": "eu-european-sleeper_8000147",
          "lat": 53.45572,
          "lon": 9.99177,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg Dammtor",
          "stopId": "dk-rejseplanen_000008020402",
          "lat": 53.56056,
          "lon": 9.98945,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.059047531336545944
        },
        {
          "type": "STOP",
          "name": "Hamburg Hbf",
          "stopId": "dk-rejseplanen_000008020400",
          "lat": 53.5525,
          "lon": 10.00666,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg Bf",
          "stopId": "dk-rejseplanen_000008020401",
          "lat": 53.4563,
          "lon": 9.99159,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.04189111292362213
        },
        {
          "type": "STOP",
          "name": "Hamburg-Altona",
          "stopId": "dk-rejseplanen_000008020403",
          "lat": 53.5525,
          "lon": 9.93499,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0016500294441357255
        },
        {
          "type": "STOP",
          "name": "Hamburg-Eidelstedt Bf",
          "stopId": "dk-rejseplanen_000008001279",
          "lat": 53.59586,
          "lon": 9.9067,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0007875463925302029
        },
        {
          "type": "STOP",
          "name": "Hamburg-Langenfelde Bf",
          "stopId": "dk-rejseplanen_000008001289",
          "lat": 53.57944,
          "lon": 9.93075,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0007874541915953159
        },
        {
          "type": "STOP",
          "name": "Hamburg Central Station (FlixTrain)",
          "stopId": "eu-flixbus_38c4c04e-e957-4115-ac23-6fa87012bde4",
          "lat": 53.55299,
          "lon": 10.00664,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.25327467918395996
        },
        {
          "type": "STOP",
          "name": "Hamburg-Bergedorf (FlixTrain <> S-Bahn)",
          "stopId": "eu-flixbus_8492e27a-1647-4abf-8cff-6cecdf2329c6",
          "lat": 53.48994,
          "lon": 10.20594,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 3.953744817408733e-05
        },
        {
          "type": "STOP",
          "name": "Hamburg-Bergedorf (FlixTrain)",
          "stopId": "eu-flixbus_4a2656a8-5fd2-45c8-8cef-9a4b55cb1577",
          "lat": 53.48994,
          "lon": 10.20594,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 3.953744817408733e-05
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg (FlixTrain)",
          "stopId": "eu-flixbus_7fe3f798-b47e-4ae2-9acd-e0b6f96c3b88",
          "lat": 53.45622,
          "lon": 9.99165,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.0003282662364654243
        },
        {
          "type": "STOP",
          "name": "Hamburg-Harburg (S-Bahn <> FlixTrain)",
          "stopId": "eu-flixbus_9387028c-0dbc-49cb-82c8-ab020be49687",
          "lat": 53.45613,
          "lon": 9.99114,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 1.3179149391362444e-05
        },
        {
          "type": "STOP",
          "name": "Burgwedel",
          "stopId": "de-DELFI_de:02000:86960",
          "lat": 53.64761,
          "lon": 9.9085,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009713191539049149
        },
        {
          "type": "STOP",
          "name": "Bönningstedt",
          "stopId": "de-DELFI_de:01056:37968",
          "lat": 53.6634,
          "lon": 9.91024,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.009632640518248081
        }
      ]
    },
    "Stockholm": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Stockholm",
        "lat": 59.325117,
        "lon": 18.071093,
        "country": "SE"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Stockholm C",
          "stopId": "dk-rejseplanen_000007400001",
          "lat": 59.32972,
          "lon": 18.05778,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00011334068403812125
        },
        {
          "type": "STOP",
          "name": "Enebyberg station",
          "stopId": "se-Trafiklab_740024372",
          "lat": 59.42559,
          "lon": 18.05129,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007849501445889473
        },
        {
          "type": "STOP",
          "name": "Vendevägen station",
          "stopId": "se-Trafiklab_740024796",
          "lat": 59.39992,
          "lon": 18.06798,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.007603987120091915
        },
        {
          "type": "STOP",
          "name": "Viggbyholm station",
          "stopId": "se-Trafiklab_740020110",
          "lat": 59.44909,
          "lon": 18.10385,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013426258228719234
        },
        {
          "type": "STOP",
          "name": "Tattby station",
          "stopId": "se-Trafiklab_740020879",
          "lat": 59.27906,
          "lon": 18.28201,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008833193220198154
        },
        {
          "type": "STOP",
          "name": "Saltsjöbaden station",
          "stopId": "se-Trafiklab_740000751",
          "lat": 59.27902,
          "lon": 18.31303,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00849140528589487
        },
        {
          "type": "STOP",
          "name": "Solsidan station",
          "stopId": "se-Trafiklab_740001150",
          "lat": 59.27092,
          "lon": 18.29594,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.009130040183663368
        },
        {
          "type": "STOP",
          "name": "Ulriksdal station",
          "stopId": "se-Trafiklab_740000781",
          "lat": 59.38075,
          "lon": 18.00026,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.018920382484793663
        },
        {
          "type": "STOP",
          "name": "Sundbyberg station",
          "stopId": "se-Trafiklab_740000773",
          "lat": 59.36103,
          "lon": 17.97094,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.026661472395062447
        },
        {
          "type": "STOP",
          "name": "Sollentuna station",
          "stopId": "se-Trafiklab_740000758",
          "lat": 59.42885,
          "lon": 17.94804,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.020177211612462997
        },
        {
          "type": "STOP",
          "name": "Storängen station",
          "stopId": "se-Trafiklab_740024809",
          "lat": 59.30564,
          "lon": 18.17778,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008327245712280273
        },
        {
          "type": "STOP",
          "name": "Saltsjö-Järla station",
          "stopId": "se-Trafiklab_740020874",
          "lat": 59.30685,
          "lon": 18.14967,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008990908041596413
        },
        {
          "type": "STOP",
          "name": "Saltsjö-Duvnäs station",
          "stopId": "se-Trafiklab_740020875",
          "lat": 59.30054,
          "lon": 18.19869,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008327245712280273
        },
        {
          "type": "STOP",
          "name": "Östervik station",
          "stopId": "se-Trafiklab_740024810",
          "lat": 59.29511,
          "lon": 18.23568,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008327245712280273
        },
        {
          "type": "STOP",
          "name": "Neglinge station",
          "stopId": "se-Trafiklab_740020877",
          "lat": 59.28853,
          "lon": 18.29214,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.00852414220571518
        },
        {
          "type": "STOP",
          "name": "Erstaviksbadet station",
          "stopId": "se-Trafiklab_740024812",
          "lat": 59.27297,
          "lon": 18.28513,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008636296726763248
        },
        {
          "type": "STOP",
          "name": "Altorp station",
          "stopId": "se-Trafiklab_740020868",
          "lat": 59.41023,
          "lon": 18.07289,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007484438829123974
        },
        {
          "type": "STOP",
          "name": "Arninge station",
          "stopId": "se-Trafiklab_740020656",
          "lat": 59.45887,
          "lon": 18.14135,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.014612025581300259
        },
        {
          "type": "STOP",
          "name": "Lahäll station",
          "stopId": "se-Trafiklab_740024371",
          "lat": 59.42403,
          "lon": 18.07408,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007484438829123974
        },
        {
          "type": "STOP",
          "name": "Lillängen station",
          "stopId": "se-Trafiklab_740024808",
          "lat": 59.30515,
          "lon": 18.16139,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008327245712280273
        },
        {
          "type": "STOP",
          "name": "Stockholm Centralstation",
          "stopId": "no-Entur_NSR:Quay:100390",
          "lat": 59.32998,
          "lon": 18.05771,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.11572118103504181
        },
        {
          "type": "STOP",
          "name": "Mörby station",
          "stopId": "se-Trafiklab_740020867",
          "lat": 59.39189,
          "lon": 18.04693,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.0347474068403244
        },
        {
          "type": "STOP",
          "name": "Häggvik station",
          "stopId": "se-Trafiklab_740000703",
          "lat": 59.44437,
          "lon": 17.93227,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.018470024690032005
        },
        {
          "type": "STOP",
          "name": "Norrviken station",
          "stopId": "se-Trafiklab_740000718",
          "lat": 59.45822,
          "lon": 17.9243,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01868319697678089
        },
        {
          "type": "STOP",
          "name": "Roslags Näsby station",
          "stopId": "se-Trafiklab_740000740",
          "lat": 59.4355,
          "lon": 18.05789,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.026702115312218666
        },
        {
          "type": "STOP",
          "name": "Flemingsberg station",
          "stopId": "se-Trafiklab_740000031",
          "lat": 59.21796,
          "lon": 17.94568,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.04214363917708397
        },
        {
          "type": "STOP",
          "name": "Universitetet station",
          "stopId": "se-Trafiklab_740024787",
          "lat": 59.36519,
          "lon": 18.05082,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.034178804606199265
        },
        {
          "type": "STOP",
          "name": "Östberga station",
          "stopId": "se-Trafiklab_740024797",
          "lat": 59.40425,
          "lon": 18.07398,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007484438829123974
        },
        {
          "type": "STOP",
          "name": "Trångsund station",
          "stopId": "se-Trafiklab_740000774",
          "lat": 59.228,
          "lon": 18.12956,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013655773364007473
        },
        {
          "type": "STOP",
          "name": "Tumba station",
          "stopId": "se-Trafiklab_740000776",
          "lat": 59.19973,
          "lon": 17.83566,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.018018098548054695
        },
        {
          "type": "STOP",
          "name": "Ensta station",
          "stopId": "se-Trafiklab_740024799",
          "lat": 59.45195,
          "lon": 18.06362,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008784562349319458
        },
        {
          "type": "STOP",
          "name": "Täby centrum station",
          "stopId": "se-Trafiklab_740000779",
          "lat": 59.44404,
          "lon": 18.07401,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.014210022054612637
        },
        {
          "type": "STOP",
          "name": "Fisksätra station",
          "stopId": "se-Trafiklab_740000693",
          "lat": 59.29416,
          "lon": 18.25665,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008821805939078331
        },
        {
          "type": "STOP",
          "name": "Tullinge station",
          "stopId": "se-Trafiklab_740000775",
          "lat": 59.20522,
          "lon": 17.90307,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017220495268702507
        },
        {
          "type": "STOP",
          "name": "Älvsjö station",
          "stopId": "se-Trafiklab_740000789",
          "lat": 59.27874,
          "lon": 18.01107,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.036361563950777054
        },
        {
          "type": "STOP",
          "name": "Årstaberg station",
          "stopId": "se-Trafiklab_740024920",
          "lat": 59.29924,
          "lon": 18.03023,
          "modes": [
            "REGIONAL_RAIL",
            "TRAM",
            "BUS"
          ],
          "importance": 0.036014530807733536
        },
        {
          "type": "STOP",
          "name": "Spånga station",
          "stopId": "se-Trafiklab_740000764",
          "lat": 59.38327,
          "lon": 17.89878,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017873575910925865
        },
        {
          "type": "STOP",
          "name": "Skogås station",
          "stopId": "se-Trafiklab_740000757",
          "lat": 59.21817,
          "lon": 18.15429,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013334663584828377
        },
        {
          "type": "STOP",
          "name": "Näsby allé station",
          "stopId": "se-Trafiklab_740020869",
          "lat": 59.42743,
          "lon": 18.08536,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007484438829123974
        },
        {
          "type": "STOP",
          "name": "Näsbypark station",
          "stopId": "se-Trafiklab_740001052",
          "lat": 59.43056,
          "lon": 18.09615,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.007635669782757759
        },
        {
          "type": "STOP",
          "name": "Solna station",
          "stopId": "se-Trafiklab_740000759",
          "lat": 59.36511,
          "lon": 18.01004,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL",
            "TRAM",
            "BUS"
          ],
          "importance": 0.02055785246193409
        },
        {
          "type": "STOP",
          "name": "Stocksund station",
          "stopId": "se-Trafiklab_740021643",
          "lat": 59.3851,
          "lon": 18.04392,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.007623650133609772
        },
        {
          "type": "STOP",
          "name": "Tibble station",
          "stopId": "se-Trafiklab_740020872",
          "lat": 59.44214,
          "lon": 18.06256,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.01326810847967863
        },
        {
          "type": "STOP",
          "name": "Jakobsberg station",
          "stopId": "se-Trafiklab_740000705",
          "lat": 59.42341,
          "lon": 17.83289,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01764526031911373
        },
        {
          "type": "STOP",
          "name": "Igelboda station",
          "stopId": "se-Trafiklab_740020876",
          "lat": 59.28762,
          "lon": 18.28033,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017412159591913223
        },
        {
          "type": "STOP",
          "name": "Ringvägen station",
          "stopId": "se-Trafiklab_740024811",
          "lat": 59.28313,
          "lon": 18.30221,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.008468789048492908
        },
        {
          "type": "STOP",
          "name": "Tippen station",
          "stopId": "se-Trafiklab_740020878",
          "lat": 59.28398,
          "lon": 18.27721,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.008636296726763248
        },
        {
          "type": "STOP",
          "name": "Hägernäs station",
          "stopId": "se-Trafiklab_740020192",
          "lat": 59.45104,
          "lon": 18.12441,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01354716345667839
        },
        {
          "type": "STOP",
          "name": "Galoppfältet station",
          "stopId": "se-Trafiklab_740024798",
          "lat": 59.44676,
          "lon": 18.08354,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013529767282307148
        },
        {
          "type": "STOP",
          "name": "Farsta Strand station",
          "stopId": "se-Trafiklab_740000692",
          "lat": 59.23653,
          "lon": 18.10166,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.016616271808743477
        },
        {
          "type": "STOP",
          "name": "Stuvsta station",
          "stopId": "se-Trafiklab_740000772",
          "lat": 59.25322,
          "lon": 17.99574,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01701357029378414
        },
        {
          "type": "STOP",
          "name": "Helenelund station",
          "stopId": "se-Trafiklab_740000701",
          "lat": 59.40964,
          "lon": 17.96153,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.01877867989242077
        },
        {
          "type": "STOP",
          "name": "Huddinge station",
          "stopId": "se-Trafiklab_740000702",
          "lat": 59.23727,
          "lon": 17.98026,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017590342089533806
        },
        {
          "type": "STOP",
          "name": "Barkarby station",
          "stopId": "se-Trafiklab_740000383",
          "lat": 59.40457,
          "lon": 17.86606,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.017115378752350807
        },
        {
          "type": "STOP",
          "name": "Bråvallavägen station",
          "stopId": "se-Trafiklab_740024795",
          "lat": 59.4056,
          "lon": 18.06059,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.007851029746234417
        },
        {
          "type": "STOP",
          "name": "Djursholms Ösby station",
          "stopId": "se-Trafiklab_740001038",
          "lat": 59.39798,
          "lon": 18.05866,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.02423957921564579
        },
        {
          "type": "STOP",
          "name": "Djursholms Ekeby station",
          "stopId": "se-Trafiklab_740020870",
          "lat": 59.41288,
          "lon": 18.05757,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.007849501445889473
        },
        {
          "type": "STOP",
          "name": "Stockholm Östra station",
          "stopId": "se-Trafiklab_740020750",
          "lat": 59.34612,
          "lon": 18.07171,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.034178804606199265
        },
        {
          "type": "STOP",
          "name": "Stockholm Odenplan station",
          "stopId": "se-Trafiklab_740001618",
          "lat": 59.34289,
          "lon": 18.05,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.03447533771395683
        },
        {
          "type": "STOP",
          "name": "Stockholm City station",
          "stopId": "se-Trafiklab_740001617",
          "lat": 59.33114,
          "lon": 18.05943,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.15202820301055908
        },
        {
          "type": "STOP",
          "name": "Stockholm Centralstation",
          "stopId": "se-Trafiklab_740000001",
          "lat": 59.33014,
          "lon": 18.05815,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.11572118103504181
        },
        {
          "type": "STOP",
          "name": "Stockholm södra station",
          "stopId": "se-Trafiklab_740000765",
          "lat": 59.31417,
          "lon": 18.06449,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.034605808556079865
        }
      ]
    },
    "Basel": {
      "city": {
        "type": "PLACE",
        "category": "place_6",
        "name": "Basel",
        "lat": 47.558395,
        "lon": 7.573271,
        "country": "CH"
      },
      "stops": [
        {
          "type": "STOP",
          "name": "Aesch BL",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:117:2:3",
          "lat": 47.46828,
          "lon": 7.60345,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006591498851776123
        },
        {
          "type": "STOP",
          "name": "Aesch BL",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:117:1:2",
          "lat": 47.46827,
          "lon": 7.60333,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006591498851776123
        },
        {
          "type": "STOP",
          "name": "Haltingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6638:2:2",
          "lat": 47.61112,
          "lon": 7.61345,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004502656403928995
        },
        {
          "type": "STOP",
          "name": "Haltingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6638:2:2",
          "lat": 47.61083,
          "lon": 7.61365,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004502656403928995
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "de-DELFI_ch:1:sloid:10",
          "lat": 47.54741,
          "lon": 7.58956,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN",
            "BUS"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "de-DELFI_ch:23005:6",
          "lat": 47.56729,
          "lon": 7.6078,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "de-DELFI_ch:23005:6_G_G",
          "lat": 47.5678,
          "lon": 7.60692,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Eimeldingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6634:1:1",
          "lat": 47.62741,
          "lon": 7.59618,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0032064078841358423
        },
        {
          "type": "STOP",
          "name": "Efringen-Kirchen Bahnhof",
          "stopId": "de-DELFI_de:08336:6631:2:4",
          "lat": 47.65511,
          "lon": 7.56528,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004543011076748371
        },
        {
          "type": "STOP",
          "name": "Efringen-Kirchen Bahnhof",
          "stopId": "de-DELFI_de:08336:6631:2:4",
          "lat": 47.65575,
          "lon": 7.56349,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004543011076748371
        },
        {
          "type": "STOP",
          "name": "Efringen-Kirchen Bahnhof",
          "stopId": "de-DELFI_de:08336:6631_G",
          "lat": 47.65562,
          "lon": 7.56392,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004543011076748371
        },
        {
          "type": "STOP",
          "name": "Eimeldingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6634:2:2",
          "lat": 47.62723,
          "lon": 7.59645,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0032064078841358423
        },
        {
          "type": "STOP",
          "name": "Binzen Bahnhof",
          "stopId": "de-DELFI_de:08336:6754",
          "lat": 47.63141,
          "lon": 7.62105,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 4.349119262769818e-05
        },
        {
          "type": "STOP",
          "name": "Liestal",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:23:2:4",
          "lat": 47.48437,
          "lon": 7.73092,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Liestal",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:23:2:3",
          "lat": 47.48442,
          "lon": 7.73099,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Liestal",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:23:1:1",
          "lat": 47.48456,
          "lon": 7.73111,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Liestal",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:23:0:723",
          "lat": 47.48454,
          "lon": 7.73097,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Liestal",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:23",
          "lat": 47.48446,
          "lon": 7.73137,
          "modes": [
            "LONG_DISTANCE",
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Muttenz",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:20:2:3",
          "lat": 47.53379,
          "lon": 7.648,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.017394408583641052
        },
        {
          "type": "STOP",
          "name": "Muttenz",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:20:1:1",
          "lat": 47.53396,
          "lon": 7.64709,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.017394408583641052
        },
        {
          "type": "STOP",
          "name": "Münchenstein",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:119:2:3",
          "lat": 47.51317,
          "lon": 7.61721,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.006740185897797346
        },
        {
          "type": "STOP",
          "name": "Pratteln",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:21:2:4",
          "lat": 47.52282,
          "lon": 7.69125,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.01660216972231865
        },
        {
          "type": "STOP",
          "name": "Saint-Louis (Haut-Rhin)",
          "stopId": "ch-opentransportdataswiss26_8718213",
          "lat": 47.59031,
          "lon": 7.55538,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.013558261096477509
        },
        {
          "type": "STOP",
          "name": "Basel St. Jakob",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:38:0:1",
          "lat": 47.54259,
          "lon": 7.61955,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 7.248532256198814e-06
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:5:10",
          "lat": 47.54599,
          "lon": 7.59172,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:5:9",
          "lat": 47.54585,
          "lon": 7.59234,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:2:3",
          "lat": 47.5464,
          "lon": 7.59226,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:21:30",
          "lat": 47.54813,
          "lon": 7.58475,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:22:35",
          "lat": 47.54825,
          "lon": 7.58484,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:22:33",
          "lat": 47.54824,
          "lon": 7.58497,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:8:16",
          "lat": 47.54697,
          "lon": 7.58723,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:0:20",
          "lat": 47.54661,
          "lon": 7.58743,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:0:19",
          "lat": 47.54668,
          "lon": 7.58749,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:7:15",
          "lat": 47.54691,
          "lon": 7.58774,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:7:14",
          "lat": 47.547,
          "lon": 7.5878,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:6:12",
          "lat": 47.54684,
          "lon": 7.58867,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10_gen:ch:1:sloid:10:6:11_pf:11AB",
          "lat": 47.54679,
          "lon": 7.58909,
          "modes": [
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "de-DELFI_ch:1:sloid:78143",
          "lat": 47.54681,
          "lon": 7.59005,
          "modes": [
            "LONG_DISTANCE",
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:3:6",
          "lat": 47.54697,
          "lon": 7.58983,
          "modes": [
            "HIGHSPEED_RAIL",
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel St. Johann",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:16:1:7",
          "lat": 47.57019,
          "lon": 7.57207,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004041478503495455
        },
        {
          "type": "STOP",
          "name": "Basel St. Johann",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:16:1:8",
          "lat": 47.57018,
          "lon": 7.57197,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.004041478503495455
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "de-DELFI_ch:23005:6:5:7",
          "lat": 47.56805,
          "lon": 7.60782,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:90:0:581195",
          "lat": 47.56809,
          "lon": 7.60789,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:90:0:529134",
          "lat": 47.56794,
          "lon": 7.60757,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:90:0:523134",
          "lat": 47.56823,
          "lon": 7.60828,
          "modes": [
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:90",
          "lat": 47.56731,
          "lon": 7.60692,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "ch-opentransportdataswiss26_8014431",
          "lat": 47.5678,
          "lon": 7.6082,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:1:1",
          "lat": 47.54659,
          "lon": 7.59214,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:1:1",
          "lat": 47.54656,
          "lon": 7.59205,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:2:4",
          "lat": 47.54664,
          "lon": 7.59136,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:3:5",
          "lat": 47.54692,
          "lon": 7.59026,
          "modes": [
            "LONG_DISTANCE",
            "NIGHT_RAIL",
            "REGIONAL_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10_gen:ch:1:sloid:10:4:8_pf:8AB",
          "lat": 47.54672,
          "lon": 7.59009,
          "modes": [
            "LONG_DISTANCE",
            "REGIONAL_RAIL",
            "HIGHSPEED_RAIL",
            "NIGHT_RAIL",
            "SUBURBAN"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "ch-opentransportdataswiss26_ch:1:sloid:10:21:30",
          "lat": 47.54808,
          "lon": 7.58475,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf (FlixTrain)",
          "stopId": "eu-flixbus_086064da-8914-415f-83cc-8d6a087f5ed2",
          "lat": 47.5678,
          "lon": 7.60692,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.0002471090410836041
        },
        {
          "type": "STOP",
          "name": "BASEL SBB",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:850000010",
          "lat": 47.54722,
          "lon": 7.58889,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "BASEL BAD BF",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:800014431",
          "lat": 47.56722,
          "lon": 7.60778,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.045299239456653595
        },
        {
          "type": "STOP",
          "name": "Grenzach Bahnhof",
          "stopId": "de-DELFI_de:08336:6604:2:2",
          "lat": 47.55096,
          "lon": 7.65939,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003212285926565528
        },
        {
          "type": "STOP",
          "name": "Grenzach Bahnhof",
          "stopId": "de-DELFI_de:08336:6604:1:1",
          "lat": 47.55097,
          "lon": 7.65954,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003212285926565528
        },
        {
          "type": "STOP",
          "name": "Grenzach Bahnhof",
          "stopId": "de-DELFI_de:08336:6604_G",
          "lat": 47.5509,
          "lon": 7.65951,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.003212285926565528
        },
        {
          "type": "STOP",
          "name": "Rümmingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6755",
          "lat": 47.64293,
          "lon": 7.64071,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 4.349119262769818e-05
        },
        {
          "type": "STOP",
          "name": "Herten (Baden) Bahnhof",
          "stopId": "de-DELFI_de:08336:6606:2:2",
          "lat": 47.54969,
          "lon": 7.74061,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0031893542036414146
        },
        {
          "type": "STOP",
          "name": "Herten (Baden) Bahnhof",
          "stopId": "de-DELFI_de:08336:6606:1:1",
          "lat": 47.54937,
          "lon": 7.73893,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0031893542036414146
        },
        {
          "type": "STOP",
          "name": "Istein Bahnhof",
          "stopId": "de-DELFI_de:08336:6632:1:1",
          "lat": 47.66098,
          "lon": 7.54291,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030865566805005074
        },
        {
          "type": "STOP",
          "name": "Istein Bahnhof",
          "stopId": "de-DELFI_de:08336:6632:2:2",
          "lat": 47.66138,
          "lon": 7.54196,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030865566805005074
        },
        {
          "type": "STOP",
          "name": "Kleinkems Bahnhof",
          "stopId": "de-DELFI_de:08336:6633:2:2",
          "lat": 47.6872,
          "lon": 7.52471,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030865566805005074
        },
        {
          "type": "STOP",
          "name": "Kleinkems Bahnhof",
          "stopId": "de-DELFI_de:08336:6633:1:1",
          "lat": 47.68493,
          "lon": 7.5249,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0030865566805005074
        },
        {
          "type": "STOP",
          "name": "Hammerstein Bahnhof",
          "stopId": "de-DELFI_de:08336:6758",
          "lat": 47.6903,
          "lon": 7.64415,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 4.349119262769818e-05
        },
        {
          "type": "STOP",
          "name": "Lörrach Gbf ARZ",
          "stopId": "de-DELFI_000008073729",
          "lat": 47.61875,
          "lon": 7.66819,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 2.767621299426537e-05
        },
        {
          "type": "STOP",
          "name": "Wollbach Bahnhof",
          "stopId": "de-DELFI_de:08336:6757",
          "lat": 47.66821,
          "lon": 7.64863,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.00016531924484297633
        },
        {
          "type": "STOP",
          "name": "Wittlingen Bahnhof",
          "stopId": "de-DELFI_de:08336:6756",
          "lat": 47.65663,
          "lon": 7.64698,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 7.19713352737017e-05
        },
        {
          "type": "STOP",
          "name": "Wyhlen Bahnhof",
          "stopId": "de-DELFI_de:08336:6605:1:1",
          "lat": 47.54636,
          "lon": 7.69085,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0031893542036414146
        },
        {
          "type": "STOP",
          "name": "Weil am Rhein Bahnhof",
          "stopId": "de-DELFI_de:08336:6639:4:9",
          "lat": 47.59401,
          "lon": 7.60817,
          "modes": [
            "HIGHSPEED_RAIL"
          ],
          "importance": 0.010398348793387413
        },
        {
          "type": "STOP",
          "name": "Weil am Rhein Bahnhof",
          "stopId": "de-DELFI_de:08336:6639:4:8",
          "lat": 47.59397,
          "lon": 7.60838,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.010398348793387413
        },
        {
          "type": "STOP",
          "name": "Weil am Rhein Bahnhof",
          "stopId": "de-DELFI_de:08336:6639:2:2",
          "lat": 47.59389,
          "lon": 7.6088,
          "modes": [
            "HIGHSPEED_RAIL",
            "REGIONAL_RAIL"
          ],
          "importance": 0.010398348793387413
        },
        {
          "type": "STOP",
          "name": "Weil am Rhein Bahnhof",
          "stopId": "de-DELFI_de:08336:6639_G",
          "lat": 47.59361,
          "lon": 7.60844,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.010398348793387413
        },
        {
          "type": "STOP",
          "name": "Saint-Louis la Chaussée",
          "stopId": "fr-horaires-sncf_FR::LMU:89c460a0-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 47.60951,
          "lon": 7.53128,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002695794915780425
        },
        {
          "type": "STOP",
          "name": "Sierentz",
          "stopId": "fr-horaires-sncf_FR::LMO:95e75f40-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 47.65589,
          "lon": 7.45933,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002695794915780425
        },
        {
          "type": "STOP",
          "name": "Bartenheim",
          "stopId": "fr-horaires-sncf_FR::LMO:7ceda260-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 47.63493,
          "lon": 7.48726,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.0026975872460752726
        },
        {
          "type": "STOP",
          "name": "Saint-Louis",
          "stopId": "fr-horaires-sncf_FR::LMU:899e13f0-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 47.59061,
          "lon": 7.55599,
          "modes": [
            "REGIONAL_RAIL",
            "BUS"
          ],
          "importance": 0.013558261096477509
        },
        {
          "type": "STOP",
          "name": "Bâle Saint-Jean",
          "stopId": "fr-horaires-sncf_FR::LMO:a864a600-cb0a-11e8-8bfa-f784c1c7c611:",
          "lat": 47.57031,
          "lon": 7.57275,
          "modes": [
            "REGIONAL_RAIL"
          ],
          "importance": 0.002647032029926777
        },
        {
          "type": "STOP",
          "name": "LIESTAL",
          "stopId": "it-trenitalia_IT::Quay:railTRENITALIA:850000023",
          "lat": 47.48417,
          "lon": 7.73139,
          "modes": [
            "LONG_DISTANCE"
          ],
          "importance": 0.030453277751803398
        },
        {
          "type": "STOP",
          "name": "Basel SBB",
          "stopId": "de-DELFI_ch:1:sloid:78143",
          "lat": 47.54735,
          "lon": 7.58899,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.1333090364933014
        },
        {
          "type": "STOP",
          "name": "Basel Bad Bf",
          "stopId": "nl-OpenOV_2992260",
          "lat": 47.56736,
          "lon": 7.60778,
          "modes": [
            "NIGHT_RAIL"
          ],
          "importance": 0.045299239456653595
        }
      ]
    }
  };

