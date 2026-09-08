// Captured Transitous /api/v1/geocode responses (trimmed to the fields Euroute uses).
// Frozen fixtures: do not refetch in tests.
import type { GeocodeHitLike } from "../station-classify";

export const GEOCODE_FIXTURES: Record<string, GeocodeHitLike[]> = {
  "London": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "London",
      "id": "node/[107775]",
      "lat": 51.507446,
      "lon": -0.127765,
      "country": "GB",
      "score": -20.0,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Greater London",
          "adminLevel": 5
        },
        {
          "name": "City of Westminster",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "London",
      "id": "node/[485248691]",
      "lat": 42.983675,
      "lon": -81.249607,
      "country": "CA",
      "score": -19.111,
      "areas": [
        {
          "name": "Canada",
          "adminLevel": 2
        },
        {
          "name": "Ontario",
          "adminLevel": 4
        },
        {
          "name": "Southwestern Ontario",
          "adminLevel": 5
        },
        {
          "name": "London",
          "adminLevel": 6
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London Bridge",
      "id": "gb-great-britain_910GLNDNBDE",
      "lat": 51.504875,
      "lon": -0.085147,
      "country": "GB",
      "modes": [
        "REGIONAL_RAIL",
        "SUBURBAN",
        "SUBWAY",
        "BUS"
      ],
      "importance": 0.252475,
      "score": -18.4,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Greater London",
          "adminLevel": 5
        },
        {
          "name": "London Borough of Southwark",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London Euston",
      "id": "gb-great-britain_910GEUSTON",
      "lat": 51.528854,
      "lon": -0.134191,
      "country": "GB",
      "modes": [
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "SUBURBAN",
        "BUS"
      ],
      "importance": 0.099423,
      "score": -18.396732,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Greater London",
          "adminLevel": 5
        },
        {
          "name": "London Borough of Camden",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London",
      "id": "rs-Beograd_20269",
      "lat": 44.807903,
      "lon": 20.462988,
      "country": "RS",
      "modes": [
        "BUS"
      ],
      "importance": 0.004643,
      "score": -18.228447,
      "areas": [
        {
          "name": "Serbia",
          "adminLevel": 2
        },
        {
          "name": "Central Serbia",
          "adminLevel": 4
        },
        {
          "name": "City of Belgrade",
          "adminLevel": 6
        },
        {
          "name": "City of Belgrade",
          "adminLevel": 7
        },
        {
          "name": "Stari Grad Urban Municipality",
          "adminLevel": 8
        },
        {
          "name": "Београд (Стари град)",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London",
      "id": "ca-Viarail_93",
      "lat": 42.98099,
      "lon": -81.246735,
      "country": "CA",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.003056,
      "score": -17.996401,
      "areas": [
        {
          "name": "Canada",
          "adminLevel": 2
        },
        {
          "name": "Ontario",
          "adminLevel": 4
        },
        {
          "name": "Southwestern Ontario",
          "adminLevel": 5
        },
        {
          "name": "London",
          "adminLevel": 6
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London Victoria",
      "id": "gb-great-britain_910GVICTRIA",
      "lat": 51.49473,
      "lon": -0.14458,
      "country": "GB",
      "modes": [
        "REGIONAL_RAIL",
        "SUBURBAN",
        "BUS"
      ],
      "importance": 0.105804,
      "score": -17.9,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Greater London",
          "adminLevel": 5
        },
        {
          "name": "City of Westminster",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London Waterloo",
      "id": "gb-great-britain_910GWATRLMN",
      "lat": 51.50284,
      "lon": -0.112801,
      "country": "GB",
      "modes": [
        "REGIONAL_RAIL",
        "BUS"
      ],
      "importance": 0.114631,
      "score": -17.9,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Greater London",
          "adminLevel": 5
        },
        {
          "name": "London Borough of Lambeth",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "New London",
      "id": "us-Amtrak_NLC",
      "lat": 41.354267,
      "lon": -72.09322,
      "country": "US",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.009001,
      "score": -17.842802,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Connecticut",
          "adminLevel": 4
        },
        {
          "name": "Southeastern Connecticut Planning Region",
          "adminLevel": 6
        },
        {
          "name": "New London",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "London Road",
      "id": "gb-great-britain_910GBRGHLRD",
      "lat": 50.83681,
      "lon": -0.136263,
      "country": "GB",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.009777,
      "score": -17.627838,
      "areas": [
        {
          "name": "United Kingdom",
          "adminLevel": 2
        },
        {
          "name": "England",
          "adminLevel": 4
        },
        {
          "name": "Brighton and Hove",
          "adminLevel": 6
        }
      ]
    }
  ],
  "Paris": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Paris",
      "id": "node/[17807753]",
      "lat": 48.853495,
      "lon": 2.348391,
      "country": "FR",
      "score": -19.25,
      "areas": [
        {
          "name": "France",
          "adminLevel": 2
        },
        {
          "name": "Metropolitan France",
          "adminLevel": 3
        },
        {
          "name": "Ile-de-France",
          "adminLevel": 4
        },
        {
          "name": "Paris",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 7
        },
        {
          "name": "Paris",
          "adminLevel": 8
        },
        {
          "name": "4th Arrondissement",
          "adminLevel": 9
        },
        {
          "name": "Quartier Les Îles",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Paris ,  -",
      "id": "br-rio-de-janeiro_3040O00014C1",
      "lat": -22.86471,
      "lon": -43.24819,
      "country": "BR",
      "modes": [
        "BUS"
      ],
      "importance": 0.011362,
      "score": -17.961523,
      "areas": [
        {
          "name": "Brazil",
          "adminLevel": 2
        },
        {
          "name": "Southeast Region",
          "adminLevel": 3
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 4
        },
        {
          "name": "Região Geográfica Intermediária do Rio de Janeiro",
          "adminLevel": 5
        },
        {
          "name": "Região Metropolitana do Rio de Janeiro",
          "adminLevel": 6
        },
        {
          "name": "Região Geográfica Imediata do Rio de Janeiro",
          "adminLevel": 7
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 8
        },
        {
          "name": "Bonsucesso",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Paris Est",
      "id": "de-DELFI_000008700011",
      "lat": 48.876976,
      "lon": 2.35912,
      "country": "FR",
      "modes": [
        "HIGHSPEED_RAIL",
        "REGIONAL_RAIL",
        "BUS"
      ],
      "importance": 0.026343,
      "score": -17.672876,
      "areas": [
        {
          "name": "France",
          "adminLevel": 2
        },
        {
          "name": "Metropolitan France",
          "adminLevel": 3
        },
        {
          "name": "Ile-de-France",
          "adminLevel": 4
        },
        {
          "name": "Paris",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 7
        },
        {
          "name": "Paris",
          "adminLevel": 8
        },
        {
          "name": "10th Arrondissement",
          "adminLevel": 9
        },
        {
          "name": "Quartier Saint-Vincent-de-Paul",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Paris-Nord",
      "id": "fr-eurostar-gtfs-plan-de-transport-et-temps-reel_paris_nord_station_area",
      "lat": 48.880947,
      "lon": 2.355314,
      "country": "FR",
      "modes": [
        "HIGHSPEED_RAIL",
        "NIGHT_RAIL"
      ],
      "importance": 0.022283,
      "score": -17.332941,
      "areas": [
        {
          "name": "France",
          "adminLevel": 2
        },
        {
          "name": "Metropolitan France",
          "adminLevel": 3
        },
        {
          "name": "Ile-de-France",
          "adminLevel": 4
        },
        {
          "name": "Paris",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 7
        },
        {
          "name": "Paris",
          "adminLevel": 8
        },
        {
          "name": "10th Arrondissement",
          "adminLevel": 9
        },
        {
          "name": "Quartier Saint-Vincent-de-Paul",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[105715620]",
      "lat": 33.661796,
      "lon": -95.555513,
      "country": "US",
      "score": -16.875,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Texas",
          "adminLevel": 4
        },
        {
          "name": "Lamar County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[153536155]",
      "lat": 36.301946,
      "lon": -88.325858,
      "country": "US",
      "score": -16.799,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Tennessee",
          "adminLevel": 4
        },
        {
          "name": "West Tennessee",
          "adminLevel": 5
        },
        {
          "name": "Henry County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[153467139]",
      "lat": 39.611146,
      "lon": -87.696137,
      "country": "US",
      "score": -16.793999,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Illinois",
          "adminLevel": 4
        },
        {
          "name": "Edgar County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[153981397]",
      "lat": 38.213209,
      "lon": -84.249207,
      "country": "US",
      "score": -16.792,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Kentucky",
          "adminLevel": 4
        },
        {
          "name": "Bourbon County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[158824862]",
      "lat": 44.223631,
      "lon": -70.512838,
      "country": "US",
      "score": -16.775,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Maine",
          "adminLevel": 4
        },
        {
          "name": "Oxford County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Paris",
      "id": "node/[151905305]",
      "lat": 35.292475,
      "lon": -93.729445,
      "country": "US",
      "score": -16.764999,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Arkansas",
          "adminLevel": 4
        },
        {
          "name": "Logan County",
          "adminLevel": 6
        },
        {
          "name": "Paris",
          "adminLevel": 8
        }
      ]
    }
  ],
  "Wien": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Wien",
      "id": "node/[17328659]",
      "lat": 48.208354,
      "lon": 16.372504,
      "country": "AT",
      "score": -18.5,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Innere Stadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Innere Stadt",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Hbf",
      "id": "at-Railway-Current-Reference-Data-2026_Pat:49:1349",
      "lat": 48.18519,
      "lon": 16.376413,
      "country": "AT",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "COACH",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "SUBURBAN",
        "SUBWAY",
        "TRAM",
        "BUS"
      ],
      "importance": 0.213316,
      "score": -17.65,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Favoriten",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Favoriten",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Wiën Tsjan",
      "id": "node/[122739684]",
      "lat": 17.964099,
      "lon": 102.613371,
      "country": "LA",
      "score": -16.65,
      "areas": [
        {
          "name": "Laos",
          "adminLevel": 2
        },
        {
          "name": "Vientiane Prefecture",
          "adminLevel": 4
        },
        {
          "name": "Chanthabuly District",
          "adminLevel": 6
        },
        {
          "name": "Vientiane Capital",
          "adminLevel": 7
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Kagran",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:627",
      "lat": 48.243419,
      "lon": 16.433492,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "TRAM",
        "BUS"
      ],
      "importance": 0.043634,
      "score": -16.449358,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Donaustadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Kagran",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Krieau",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:1893",
      "lat": 48.214617,
      "lon": 16.413873,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "BUS"
      ],
      "importance": 0.035039,
      "score": -16.330084,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Leopoldstadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Leopoldstadt",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Stadlau",
      "id": "at-Railway-Current-Reference-Data-2026_Pat:49:1299",
      "lat": 48.2193,
      "lon": 16.44853,
      "country": "AT",
      "modes": [
        "REGIONAL_RAIL",
        "SUBURBAN",
        "SUBWAY",
        "BUS",
        "ODM"
      ],
      "importance": 0.053927,
      "score": -16.313478,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Donaustadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Stadlau",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Erdberg",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:289",
      "lat": 48.191315,
      "lon": 16.414313,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "BUS"
      ],
      "importance": 0.041266,
      "score": -16.168621,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Landstraße",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Landstraße",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Stadion",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:1894",
      "lat": 48.210367,
      "lon": 16.420691,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "TRAM",
        "BUS",
        "ODM"
      ],
      "importance": 0.03664,
      "score": -16.104351,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Leopoldstadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Leopoldstadt",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Neulaa",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:1481",
      "lat": 48.145691,
      "lon": 16.385962,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "BUS",
        "ODM"
      ],
      "importance": 0.022669,
      "score": -16.092634,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Favoriten",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Oberlaa Stadt",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Wien Rathaus",
      "id": "at-PTA-Eastern-Region-Flex-2026_Pat:49:1072",
      "lat": 48.210026,
      "lon": 16.355348,
      "country": "AT",
      "modes": [
        "SUBWAY",
        "TRAM"
      ],
      "importance": 0.035641,
      "score": -16.089312,
      "areas": [
        {
          "name": "Austria",
          "adminLevel": 2
        },
        {
          "name": "Vienna",
          "adminLevel": 4
        },
        {
          "name": "Josefstadt",
          "adminLevel": 9
        },
        {
          "name": "Katastralgemeinde Josefstadt",
          "adminLevel": 10
        }
      ]
    }
  ],
  "Roma": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Roma",
      "id": "node/[72959652]",
      "lat": 41.89332,
      "lon": 12.482932,
      "country": "IT",
      "score": -18.5,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Lazio",
          "adminLevel": 4
        },
        {
          "name": "Roma Capitale",
          "adminLevel": 6
        },
        {
          "name": "Rome",
          "adminLevel": 8
        },
        {
          "name": "Municipio Roma I",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Roma",
      "id": "pt-Metro-Lisboa_RM",
      "lat": 38.74845,
      "lon": -9.141349,
      "country": "PT",
      "modes": [
        "SUBWAY"
      ],
      "importance": 0.029188,
      "score": -17.727997,
      "areas": [
        {
          "name": "Portugal",
          "adminLevel": 2
        },
        {
          "name": "Lisbon",
          "adminLevel": 6
        },
        {
          "name": "Lisbon",
          "adminLevel": 7
        },
        {
          "name": "Alvalade",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Roma ,  -",
      "id": "br-rio-de-janeiro_3040O00034C0",
      "lat": -22.86532,
      "lon": -43.24895,
      "country": "BR",
      "modes": [
        "BUS"
      ],
      "importance": 0.002396,
      "score": -16.328028,
      "areas": [
        {
          "name": "Brazil",
          "adminLevel": 2
        },
        {
          "name": "Southeast Region",
          "adminLevel": 3
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 4
        },
        {
          "name": "Região Geográfica Intermediária do Rio de Janeiro",
          "adminLevel": 5
        },
        {
          "name": "Região Metropolitana do Rio de Janeiro",
          "adminLevel": 6
        },
        {
          "name": "Região Geográfica Imediata do Rio de Janeiro",
          "adminLevel": 7
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 8
        },
        {
          "name": "Bonsucesso",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "RE DI ROMA",
      "id": "it-Lazio-Rome_AD16",
      "lat": 41.881725,
      "lon": 12.513994,
      "country": "IT",
      "modes": [
        "SUBWAY",
        "BUS"
      ],
      "importance": 0.011883,
      "score": -15.739852,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Lazio",
          "adminLevel": 4
        },
        {
          "name": "Roma Capitale",
          "adminLevel": 6
        },
        {
          "name": "Rome",
          "adminLevel": 8
        },
        {
          "name": "Municipio Roma VII",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Roma",
      "id": "ro-Bucuresti-Ilfov_3118",
      "lat": 44.45275,
      "lon": 26.094486,
      "country": "RO",
      "modes": [
        "TRAM",
        "BUS"
      ],
      "importance": 0.000669,
      "score": -15.622688,
      "areas": [
        {
          "name": "Romania",
          "adminLevel": 2
        },
        {
          "name": "Bucharest",
          "adminLevel": 4
        },
        {
          "name": "Sector 1",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Padre Roma ,  -",
      "id": "br-rio-de-janeiro_3061O00036C0",
      "lat": -22.911833,
      "lon": -43.27449,
      "country": "BR",
      "modes": [
        "BUS"
      ],
      "importance": 0.00318,
      "score": -15.246401,
      "areas": [
        {
          "name": "Brazil",
          "adminLevel": 2
        },
        {
          "name": "Southeast Region",
          "adminLevel": 3
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 4
        },
        {
          "name": "Região Geográfica Intermediária do Rio de Janeiro",
          "adminLevel": 5
        },
        {
          "name": "Região Metropolitana do Rio de Janeiro",
          "adminLevel": 6
        },
        {
          "name": "Região Geográfica Imediata do Rio de Janeiro",
          "adminLevel": 7
        },
        {
          "name": "Rio de Janeiro",
          "adminLevel": 8
        },
        {
          "name": "Engenho Novo",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Roma",
      "id": "node/[5680535526]",
      "lat": 26.409408,
      "lon": -99.014458,
      "country": "US",
      "score": -15.057,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Texas",
          "adminLevel": 4
        },
        {
          "name": "Starr County",
          "adminLevel": 6
        },
        {
          "name": "Roma",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Roma",
      "id": "node/[1895756363]",
      "lat": -26.571036,
      "lon": 148.786814,
      "country": "AU",
      "score": -15.032,
      "areas": [
        {
          "name": "Australia",
          "adminLevel": 2
        },
        {
          "name": "Queensland",
          "adminLevel": 4
        },
        {
          "name": "Maranoa Regional",
          "adminLevel": 6
        },
        {
          "name": "Roma",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Roma",
      "id": "node/[2431091642]",
      "lat": -7.765642,
      "lon": -79.146834,
      "country": "PE",
      "score": -15.031,
      "areas": [
        {
          "name": "Peru",
          "adminLevel": 2
        },
        {
          "name": "La Libertad",
          "adminLevel": 4
        },
        {
          "name": "Ascope",
          "adminLevel": 6
        },
        {
          "name": "Casa Grande",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Roma",
      "id": "node/[1362724382]",
      "lat": -29.450553,
      "lon": 27.714153,
      "country": "LS",
      "score": -15.0,
      "areas": [
        {
          "name": "Lesotho",
          "adminLevel": 2
        },
        {
          "name": "Maseru District",
          "adminLevel": 5
        }
      ]
    }
  ],
  "Firenze": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Firenze",
      "id": "node/[61753360]",
      "lat": 43.769796,
      "lon": 11.25564,
      "country": "IT",
      "score": -19.664,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 1",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze Smn",
      "id": "it-Toscana-Trenitalia_S06421_1",
      "lat": 43.77679,
      "lon": 11.247933,
      "country": "IT",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.024497,
      "score": -19.134237,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 1",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze Rifredi",
      "id": "it-trenitalia_IT::StopPlace:otherTRENITALIA:830006420",
      "lat": 43.800855,
      "lon": 11.235735,
      "country": "IT",
      "modes": [
        "LONG_DISTANCE",
        "REGIONAL_RAIL"
      ],
      "importance": 0.038836,
      "score": -18.38604,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 5",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze C.M.",
      "id": "it-Toscana-Trenitalia_S06900_1",
      "lat": 43.77694,
      "lon": 11.276874,
      "country": "IT",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.011566,
      "score": -17.97113,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 2",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze Castello",
      "id": "it-trenitalia_IT::StopPlace:otherTRENITALIA:830006419",
      "lat": 43.819428,
      "lon": 11.218384,
      "country": "IT",
      "modes": [
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL"
      ],
      "importance": 0.009003,
      "score": -17.342802,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 5",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze Statuto",
      "id": "it-Toscana-Trenitalia_S06430_1",
      "lat": 43.787437,
      "lon": 11.249958,
      "country": "IT",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.004362,
      "score": -17.17906,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 5",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "FIRENZE CAMPO MARTE",
      "id": "it-trenitalia_IT::StopPlace:otherTRENITALIA:830006900",
      "lat": 43.776837,
      "lon": 11.277023,
      "country": "IT",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "BUS"
      ],
      "importance": 0.016061,
      "score": -17.155149,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 2",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "FIRENZE",
      "id": "it-Campania-ANM_1148",
      "lat": 40.854145,
      "lon": 14.270784,
      "country": "IT",
      "modes": [
        "BUS"
      ],
      "importance": 0.000119,
      "score": -16.85,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Campania",
          "adminLevel": 4
        },
        {
          "name": "Naples",
          "adminLevel": 6
        },
        {
          "name": "Naples",
          "adminLevel": 8
        },
        {
          "name": "Municipalità 4",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "FIRENZE",
      "id": "it-Emilia-Romagna-TPER-Bologna_1118",
      "lat": 44.469967,
      "lon": 11.385631,
      "country": "IT",
      "modes": [],
      "importance": 0.0,
      "score": -16.85,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Emilia-Romagna",
          "adminLevel": 4
        },
        {
          "name": "Bologna",
          "adminLevel": 6
        },
        {
          "name": "Bologna",
          "adminLevel": 8
        },
        {
          "name": "Savena",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Firenze Rovezzano",
      "id": "it-Toscana-Trenitalia_S06901_1",
      "lat": 43.769043,
      "lon": 11.30936,
      "country": "IT",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.00443,
      "score": -16.704315,
      "areas": [
        {
          "name": "Italy",
          "adminLevel": 2
        },
        {
          "name": "Tuscany",
          "adminLevel": 4
        },
        {
          "name": "Florence",
          "adminLevel": 6
        },
        {
          "name": "Florence",
          "adminLevel": 8
        },
        {
          "name": "Quartiere 2",
          "adminLevel": 10
        }
      ]
    }
  ],
  "Hamburg": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Hamburg",
      "id": "node/[20833623]",
      "lat": 53.550172,
      "lon": 10.001316,
      "country": "DE",
      "score": -20.75,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Hamburg-Mitte",
          "adminLevel": 9
        },
        {
          "name": "Altstadt",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Hamburg Hbf",
      "id": "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1",
      "lat": 53.552475,
      "lon": 10.008095,
      "country": "DE",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "COACH",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "SUBURBAN",
        "SUBWAY",
        "BUS"
      ],
      "importance": 0.253275,
      "score": -19.9,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Hamburg-Mitte",
          "adminLevel": 9
        },
        {
          "name": "St. Georg",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Hamburg Dammtor",
      "id": "de-DELFI_de:02000:8002548",
      "lat": 53.560753,
      "lon": 9.989566,
      "country": "DE",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "REGIONAL_RAIL",
        "SUBURBAN"
      ],
      "importance": 0.059048,
      "score": -18.613565,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Eimsbüttel",
          "adminLevel": 9
        },
        {
          "name": "Rotherbaum",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Hamburg-Harburg",
      "id": "at-Railway-Current-Reference-Data-2026_de:02000:49950:1:1",
      "lat": 53.45555,
      "lon": 9.992428,
      "country": "DE",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "BUS"
      ],
      "importance": 0.041891,
      "score": -18.42647,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Harburg",
          "adminLevel": 9
        },
        {
          "name": "Harburg",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_capital_8",
      "name": "Hamburg",
      "id": "node/[151412534]",
      "lat": 33.228176,
      "lon": -91.797629,
      "country": "US",
      "score": -18.264,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Arkansas",
          "adminLevel": 4
        },
        {
          "name": "Ashley County",
          "adminLevel": 6
        },
        {
          "name": "Hamburg",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "New Hamburg",
      "id": "us-ny-MetroNorth_49",
      "lat": 41.58745,
      "lon": -73.94723,
      "country": "US",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.003573,
      "score": -18.064348,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "New York",
          "adminLevel": 4
        },
        {
          "name": "Dutchess County",
          "adminLevel": 6
        },
        {
          "name": "Town of Poughkeepsie",
          "adminLevel": 7
        },
        {
          "name": "New Hamburg",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Hamburg",
      "id": "node/[158314652]",
      "lat": 40.555308,
      "lon": -75.982408,
      "country": "US",
      "score": -17.271,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "Pennsylvania",
          "adminLevel": 4
        },
        {
          "name": "Berks County",
          "adminLevel": 6
        },
        {
          "name": "Hamburg",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "town",
      "name": "Hamburg",
      "id": "node/[3986940442]",
      "lat": 42.716293,
      "lon": -78.828717,
      "country": "US",
      "score": -17.25,
      "areas": [
        {
          "name": "United States",
          "adminLevel": 2
        },
        {
          "name": "New York",
          "adminLevel": 4
        },
        {
          "name": "Erie County",
          "adminLevel": 6
        },
        {
          "name": "Town of Hamburg",
          "adminLevel": 7
        },
        {
          "name": "Village of Hamburg",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Hamburg-Altona",
      "id": "at-Railway-Current-Reference-Data-2026_Pde:02000:80953",
      "lat": 53.552692,
      "lon": 9.935187,
      "country": "DE",
      "modes": [
        "HIGHSPEED_RAIL",
        "NIGHT_RAIL",
        "REGIONAL_RAIL"
      ],
      "importance": 0.00165,
      "score": -16.905149,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Altona",
          "adminLevel": 9
        },
        {
          "name": "Altona-Nord",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Studio Hamburg",
      "id": "de-DELFI_000016202208",
      "lat": 53.5857,
      "lon": 10.124759,
      "country": "DE",
      "modes": [
        "BUS"
      ],
      "importance": 0.001,
      "score": -16.65,
      "areas": [
        {
          "name": "Germany",
          "adminLevel": 2
        },
        {
          "name": "Hamburg",
          "adminLevel": 4
        },
        {
          "name": "Wandsbek",
          "adminLevel": 9
        },
        {
          "name": "Tonndorf",
          "adminLevel": 10
        }
      ]
    }
  ],
  "Stockholm": [
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Stockholm",
      "id": "node/[25929985]",
      "lat": 59.325117,
      "lon": 18.071093,
      "country": "SE",
      "score": -22.25,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Södermalms stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Gamla stan",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm City station",
      "id": "se-Trafiklab_740001617",
      "lat": 59.331142,
      "lon": 18.059433,
      "country": "SE",
      "modes": [
        "REGIONAL_RAIL",
        "SUBWAY"
      ],
      "importance": 0.152028,
      "score": -19.4,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Norra innerstadens stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Norrmalm",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm Centralstation",
      "id": "se-Trafiklab_740000001",
      "lat": 59.33014,
      "lon": 18.058153,
      "country": "SE",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "BUS"
      ],
      "importance": 0.115721,
      "score": -19.15,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Norra innerstadens stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Norrmalm",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm södra station",
      "id": "se-Trafiklab_740000765",
      "lat": 59.31417,
      "lon": 18.064493,
      "country": "SE",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.034606,
      "score": -18.573845,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Södermalms stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Södermalm",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm Östra station",
      "id": "se-Trafiklab_740020750",
      "lat": 59.346115,
      "lon": 18.071712,
      "country": "SE",
      "modes": [
        "REGIONAL_RAIL"
      ],
      "importance": 0.034179,
      "score": -18.564348,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Norra innerstadens stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Norra Djurgården",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm Luma",
      "id": "se-Trafiklab_740024929",
      "lat": 59.303997,
      "lon": 18.093336,
      "country": "SE",
      "modes": [
        "TRAM",
        "BUS"
      ],
      "importance": 0.000825,
      "score": -18.528862,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Södermalms stadsdelsområde",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm",
      "id": "fi-fintraffic_361295",
      "lat": 59.351048,
      "lon": 18.115221,
      "country": "SE",
      "modes": [
        "FERRY"
      ],
      "importance": 3.9e-05,
      "score": -18.35,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Norra innerstadens stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Ladugårdsgärdet",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm",
      "id": "fi-fintraffic_379927",
      "lat": 59.3161,
      "lon": 18.0991,
      "country": "SE",
      "modes": [
        "FERRY"
      ],
      "importance": 8e-05,
      "score": -18.35,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Stockholm County",
          "adminLevel": 4
        },
        {
          "name": "Stockholm Municipality",
          "adminLevel": 7
        },
        {
          "name": "Södermalms stadsdelsområde",
          "adminLevel": 9
        },
        {
          "name": "Södermalm",
          "adminLevel": 10
        }
      ]
    },
    {
      "type": "STOP",
      "name": "STOCKHOLM",
      "id": "fr-agregat-des-reseaux-urbains-et-interurbains-en-region-grand-est_ST:7812",
      "lat": 49.348366,
      "lon": 6.207663,
      "country": "FR",
      "modes": [
        "BUS"
      ],
      "importance": 4.2e-05,
      "score": -18.35,
      "areas": [
        {
          "name": "France",
          "adminLevel": 2
        },
        {
          "name": "Metropolitan France",
          "adminLevel": 3
        },
        {
          "name": "Grand Est",
          "adminLevel": 4
        },
        {
          "name": "Moselle",
          "adminLevel": 6
        },
        {
          "name": "Thionville",
          "adminLevel": 7
        },
        {
          "name": "Yutz",
          "adminLevel": 8
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Stockholm",
      "id": "se-Trafiklab_740018664",
      "lat": 60.92795,
      "lon": 16.592108,
      "country": "SE",
      "modes": [
        "BUS"
      ],
      "importance": 0.0,
      "score": -18.35,
      "areas": [
        {
          "name": "Sweden",
          "adminLevel": 2
        },
        {
          "name": "Gävleborg County",
          "adminLevel": 4
        },
        {
          "name": "Ockelbo kommun",
          "adminLevel": 7
        }
      ]
    }
  ],
  "Basel": [
    {
      "type": "STOP",
      "name": "BASEL SBB",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:10",
      "lat": 47.547413,
      "lon": 7.589561,
      "country": "CH",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "SUBURBAN",
        "TRAM",
        "BUS"
      ],
      "importance": 0.133309,
      "score": -18.4,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Gundeldingen",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel Bad Bf",
      "id": "de-DELFI_ch:23005:6",
      "lat": 47.567287,
      "lon": 7.607805,
      "country": "CH",
      "modes": [
        "HIGHSPEED_RAIL",
        "LONG_DISTANCE",
        "NIGHT_RAIL",
        "REGIONAL_RAIL",
        "SUBURBAN",
        "BUS"
      ],
      "importance": 0.045299,
      "score": -17.218924,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Hirzbrunnen",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "PLACE",
      "category": "place_6",
      "name": "Basel",
      "id": "node/[27284711]",
      "lat": 47.558108,
      "lon": 7.587826,
      "country": "CH",
      "score": -17.122,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Altstadt Grossbasel",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel",
      "id": "eu-blablacar-bus_SEL",
      "lat": 47.5461,
      "lon": 7.589041,
      "country": "CH",
      "modes": [
        "COACH"
      ],
      "importance": 0.000525,
      "score": -16.152575,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Gundeldingen",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel, IWB",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:160",
      "lat": 47.546673,
      "lon": 7.584368,
      "country": "CH",
      "modes": [
        "TRAM"
      ],
      "importance": 0.00145,
      "score": -16.082659,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Gundeldingen",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel, Zoo",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:88783",
      "lat": 47.548832,
      "lon": 7.583047,
      "country": "CH",
      "modes": [
        "TRAM"
      ],
      "importance": 0.000923,
      "score": -15.778862,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Gundeldingen",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel, MParc",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:88776",
      "lat": 47.538788,
      "lon": 7.606584,
      "country": "CH",
      "modes": [
        "TRAM"
      ],
      "importance": 0.001677,
      "score": -15.655149,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "St. Alban",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel, Ciba",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:88767",
      "lat": 47.573414,
      "lon": 7.590252,
      "country": "CH",
      "modes": [
        "TRAM",
        "BUS"
      ],
      "importance": 0.001198,
      "score": -15.65,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Klybeck",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel Dreispitz",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:136",
      "lat": 47.537437,
      "lon": 7.609593,
      "country": "CH",
      "modes": [
        "SUBURBAN",
        "TRAM",
        "BUS"
      ],
      "importance": 0.00952,
      "score": -15.616409,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "St. Alban",
          "adminLevel": 9
        }
      ]
    },
    {
      "type": "STOP",
      "name": "Basel, Breite",
      "id": "ch-opentransportdataswiss26_Parentch:1:sloid:78306",
      "lat": 47.55549,
      "lon": 7.614749,
      "country": "CH",
      "modes": [
        "TRAM",
        "BUS"
      ],
      "importance": 0.00165,
      "score": -15.405149,
      "areas": [
        {
          "name": "Switzerland",
          "adminLevel": 2
        },
        {
          "name": "Basel-City",
          "adminLevel": 4
        },
        {
          "name": "Basel",
          "adminLevel": 8
        },
        {
          "name": "Breite",
          "adminLevel": 9
        }
      ]
    }
  ]
};
