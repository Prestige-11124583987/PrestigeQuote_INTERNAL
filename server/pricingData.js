export const pricingData = {
  "metadata": {
    "sourceWorkbook": "New Estimate Template v3.xlsx",
    "notes": [
      "Customer-facing selling prices and quote options."
    ],
    "discountPolicy": "Discount applies to total unit price: base price plus selected add-ons, before quantity.",
    "installDiscountPolicy": "Installation discount is applied separately to installation revenue."
  },
  "styles": {
    "Traditional": {
      "pricePerSf": 225
    },
    "Slim Line": {
      "pricePerSf": 210
    },
    "Interior Partitions": {
      "pricePerSf": 120
    }
  },
  "addOns": [
    {
      "name": "Level I Customization",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 26.84,
        "Slim Line": 26.84,
        "Interior Partitions": 0
      }
    },
    {
      "name": "Level II Customization",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 86.84,
        "Slim Line": 86.84,
        "Interior Partitions": 0
      }
    },
    {
      "name": "Level III Customization",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 0,
        "Slim Line": 0,
        "Interior Partitions": 0
      }
    },
    {
      "name": "Magnetic Screen",
      "units": "/ Slab(s)",
      "driver": "Slabs",
      "prices": {
        "Traditional": 160,
        "Slim Line": 160,
        "Interior Partitions": 0
      }
    },
    {
      "name": "Simulated Divided Lites (SDL)",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 0,
        "Slim Line": 5.56,
        "Interior Partitions": 5.56
      }
    },
    {
      "name": "True Divided Lites (TDL)",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 0,
        "Slim Line": 6,
        "Interior Partitions": 11.14
      }
    },
    {
      "name": "Impact Glass",
      "units": "/ SF of Glass",
      "driver": "Glass",
      "prices": {
        "Traditional": 40,
        "Slim Line": 40,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "Arctic Glass Treatment",
      "units": "/ SF of Glass",
      "driver": "Glass",
      "prices": {
        "Traditional": 37.8,
        "Slim Line": 37.8,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "Low E (FREE)",
      "units": "/ SF of Glass",
      "driver": "Glass",
      "prices": {
        "Traditional": 0,
        "Slim Line": 0,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "Marine Coating",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 13.8,
        "Slim Line": 13.8,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "VerdiGreen Paint",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 11.16,
        "Slim Line": 11.16,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "EP56 Steel",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 0,
        "Slim Line": 0,
        "Interior Partitions": 5,
        "Interior Partitions (Operable)": 16
      }
    },
    {
      "name": "EP57 Steel (Thermal Break)",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 0,
        "Slim Line": 0,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    },
    {
      "name": "Thermal Break 2.0",
      "units": "/ SF",
      "driver": "SF",
      "prices": {
        "Traditional": 96.6,
        "Slim Line": 92.9,
        "Interior Partitions": 40.6
      }
    },
    {
      "name": "Deadbolt",
      "units": "/ Door(s)",
      "driver": "Each",
      "prices": {
        "Traditional": 40,
        "Slim Line": 40,
        "Interior Partitions": 40
      }
    },
    {
      "name": "Operable Handle",
      "units": "/ Door(s)",
      "driver": "Each",
      "prices": {
        "Traditional": 250,
        "Slim Line": 250,
        "Interior Partitions": 80
      }
    },
    {
      "name": "Stained Glass",
      "units": "/ SF of Glass",
      "driver": "Glass",
      "prices": {
        "Traditional": 12,
        "Slim Line": 12,
        "Interior Partitions": 12
      }
    },
    {
      "name": "Mosaic Glass",
      "units": "/ SF of Glass",
      "driver": "Glass",
      "prices": {
        "Traditional": 0,
        "Slim Line": 0,
        "Interior Partitions": 0,
        "Interior Partitions (Operable)": 0
      }
    }
  ],
  "discounts": {
    "Retail": {
      "Low": 0.18,
      "High": 0.22
    },
    "Builder": {
      "Low": 0.3,
      "High": 0.35
    },
    "Distributor": {
      "Low": 0.4,
      "High": 0.45
    }
  },
  "install": {
    "New Build": 1500,
    "Retrofit": 2500,
    "Window": 850,
    "Distance Fee": 500
  },
  "referenceLists": {
    "Styles": [
      "Traditional",
      "Slim Line",
      "Interior Partitions",
      "[TBD]"
    ],
    "Slabs": [
      1,
      2
    ],
    "Build Types": [
      "New Build",
      "Retrofit",
      "Window"
    ],
    "Swing": [
      "LH Inswing",
      "LH Outswing",
      "RH Inswing",
      "RH Outswing"
    ],
    "Glass Type": [
      "Clear",
      "LowE",
      "Arctic",
      "Rain",
      "Glacier",
      "Frosted"
    ],
    "Glass Color": [
      "Clear ",
      "Pink",
      "Red",
      "Blue",
      "Brown",
      "Green",
      "Multi"
    ],
    "Colors": [
      "Matte Black",
      "Bronze Patina",
      "Aged Bronze Patina",
      "Aged Bronze",
      "Aged Pewter",
      "Aged Pewter Patina",
      "Bahama Brown 309",
      "Aged Copper Patina",
      "Aged Copper"
    ],
    "Customer Type": [
      "Retail",
      "Builder",
      "Distributor"
    ],
    "Discount Tier": [
      "Low",
      "High"
    ],
    "Yes/No": [
      "Yes",
      "No"
    ],
    "Accessibility": [
      "Standard",
      "ADA Compliant"
    ]
  }
};
