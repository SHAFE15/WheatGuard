"""Disease metadata and recommendations for WheatGuard."""

DISEASE_CATALOG = {
    "BlackPoint": {
        "id": "black_point",
        "display_name": "Black Point",
        "scientific_name": "Alternaria alternata / Bipolaris sorokiniana",
        "type": "disease",
        "color": "#D4A017",
        "bg_glow": "rgba(212, 160, 23, 0.15)",
        "badge_color": "#d97706",
        "severity": "Moderate",
        "tag_icon": "⚫",
        "short_desc": "Fungal infection affecting the embryo end of the wheat kernel, causing dark brown or black discoloration.",
        "full_desc": "Black Point is a fungal disease complex primarily induced by Alternaria alternata and Bipolaris sorokiniana during warm, humid conditions during grain filling. It impairs germination vigor and downgrades milling quality.",
        "symptoms": "Dark brown to coal-black discoloration at the germ/embryo end of mature wheat grains. In severe cases, discoloration spreads along the crease.",
        "treatment": "Treat seed lots with Carboxin + Thiram (2.5 g/kg seed) before sowing. Apply Propiconazole 25% EC at flowering if wet humid weather persists.",
        "prevention": "Avoid excessive irrigation after heading. Harvest promptly once mature to avoid rain damage. Plant resistant or tolerant cultivars."
    },
    "FusariumFootRot": {
        "id": "fusarium_foot_rot",
        "display_name": "Fusarium Foot Rot",
        "scientific_name": "Fusarium culmorum / F. pseudograminearum",
        "type": "disease",
        "color": "#F97316",
        "bg_glow": "rgba(249, 115, 22, 0.15)",
        "badge_color": "#ea580c",
        "severity": "High",
        "tag_icon": "🌿",
        "short_desc": "Stem base and crown rot causing brown staining, tiller death, and premature white heads.",
        "full_desc": "Fusarium Foot Rot (Crown Rot) invades the subcrown internode and lower culms, restricting vascular flow of water and nutrients. Under drought stress or high nitrogen, infection escalates rapidly.",
        "symptoms": "Honey-brown to chocolate-brown lesions at lower stem nodes and crown roots; premature senescence resulting in whiteheads with pinched grain.",
        "treatment": "Foliar treatments have limited efficacy against established crown rot; apply seed treatments containing Fludioxonil or Difenoconazole at planting.",
        "prevention": "Rotate wheat with non-graminaceous crops (chickpeas, canola, lentils). Manage stubble and maintain balanced soil nutrition without excess vegetative nitrogen."
    },
    "HealthyLeaf": {
        "id": "healthy",
        "display_name": "Healthy Crop",
        "scientific_name": "Triticum aestivum (Optimal Physiological State)",
        "type": "healthy",
        "color": "#22C55E",
        "bg_glow": "rgba(34, 197, 94, 0.15)",
        "badge_color": "#16a34a",
        "severity": "None",
        "tag_icon": "🌾",
        "short_desc": "No fungal pathogens or necrotic lesions detected. Crop displays optimal canopy vigor.",
        "full_desc": "The scanned wheat tissue shows healthy chlorophyll distribution, intact cuticle barriers, and absence of characteristic pathogenic lesions or sporulation.",
        "symptoms": "Uniform deep green foliage, clean leaf sheaths, vibrant flag leaves, and robust ear development.",
        "treatment": "No fungicide intervention needed. Maintain scheduled irrigation intervals and balanced micronutrient management.",
        "prevention": "Continue regular field scouting twice weekly, particularly during humid weather or rapid vegetative spurts."
    },
    "LeafBlight": {
        "id": "leaf_blight",
        "display_name": "Leaf Blight",
        "scientific_name": "Bipolaris sorokiniana (Spot Blight)",
        "type": "disease",
        "color": "#84CC16",
        "bg_glow": "rgba(132, 204, 22, 0.15)",
        "badge_color": "#65a30d",
        "severity": "High",
        "tag_icon": "🍂",
        "short_desc": "Foliar necrotic lesions cutting photosynthetic capacity across South Asian wheat belts.",
        "full_desc": "Spot Blight (Helminthosporium Leaf Blight) is one of the most destructive diseases in South Asia. Small chlorotic spots enlarge into oval-to-elongated brown lesions, coalescing and burning off leaves prematurely.",
        "symptoms": "Elliptical to lens-shaped dark brown lesions with chlorotic yellow halos on lower and flag leaves. Blighted leaves wither and curl.",
        "treatment": "Spray Propiconazole 25% EC (0.1%) or Azoxystrobin + Tebuconazole at the first appearance of foliar lesions on lower leaves.",
        "prevention": "Use clean, treated seed. Apply adequate potash and zinc fertilizers. Avoid planting late to evade peak high temperatures during grain fill."
    },
    "WheatBlast": {
        "id": "wheat_blast",
        "display_name": "Wheat Blast",
        "scientific_name": "Magnaporthe oryzae pathotype Triticum (MoT)",
        "type": "disease",
        "color": "#EF4444",
        "bg_glow": "rgba(239, 68, 68, 0.15)",
        "badge_color": "#dc2626",
        "severity": "Critical",
        "tag_icon": "💥",
        "short_desc": "High-risk quarantine disease causing sudden spike bleaching and complete grain loss.",
        "full_desc": "Wheat Blast is a devastating fungal pathogen that attacks the rachis, cutting off nutrient transport to all spikelets above the point of infection. Fields can suffer up to 100% loss within days under warm, rainy conditions.",
        "symptoms": "Bleached or chalky white wheat heads while the stem and leaves below remain green. Greyish fungal sporulation at the base of infected rachis segments.",
        "treatment": "Emergency intervention: Apply Strobilurin + Triazole combinations (e.g. Azoxystrobin + Difenoconazole or Trifloxystrobin + Tebuconazole) at early heading.",
        "prevention": "Observe quarantine advisories and planting date windows. Destroy infected volunteer plants. Avoid sowing during unseasonably wet, warm weather periods."
    }
}


def get_disease_info(raw_class_name):
    """Normalize raw model class name and return corresponding metadata."""
    clean = raw_class_name.replace(" ", "").replace("_", "").replace("-", "")
    # Check direct match or lowercase match
    for k, v in DISEASE_CATALOG.items():
        if k.lower() == clean.lower() or v["display_name"].lower() == raw_class_name.lower():
            return v
    # Fallback
    return {
        "id": clean.lower(),
        "display_name": raw_class_name,
        "scientific_name": "Wheat Pathogen Complex",
        "type": "disease" if "healthy" not in clean.lower() else "healthy",
        "color": "#D4A017",
        "bg_glow": "rgba(212, 160, 23, 0.15)",
        "badge_color": "#d97706",
        "severity": "Moderate",
        "tag_icon": "🌾",
        "short_desc": f"Detected {raw_class_name} symptoms on wheat tissue.",
        "full_desc": f"Analysis indicates characteristic signatures consistent with {raw_class_name}.",
        "symptoms": "Lesions and localized tissue stress observed.",
        "treatment": "Consult agricultural extension specialist for recommended fungicides and management.",
        "prevention": "Maintain regular field scouting and certified seed hygiene."
    }
