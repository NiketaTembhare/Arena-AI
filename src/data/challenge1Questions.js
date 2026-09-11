// Challenge 1: AI OR REAL? Question Bank (20 high-fidelity realistic image pairs)

// We provide high quality SVG photographic compositions & canvas-rendered visual cards
// that demonstrate realistic subtle differences (e.g. subtle lighting artifacts, reflections, pupils, texture consistency)
// zero external image broken links!

export const CHALLENGE_1_QUESTIONS = [
  {
    id: "c1_01",
    category: "Executive Portrait",
    title: "Executive Headshot",
    imageA: {
      type: "real",
      label: "Studio Portrait",
      visualType: "executive_real",
      description: "Natural studio light falloff, authentic micro skin texture, slight facial asymmetry, real hair stranding."
    },
    imageB: {
      type: "ai",
      label: "Diffusion Synthesis",
      visualType: "executive_ai",
      description: "Hyper-smooth skin rendering, identical reflection highlights in both iris pupils, synthetic collar seam."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: notice the perfectly symmetrical iris highlights and synthetic fabric seam blur on the collar.",
    difficulty: "Medium"
  },
  {
    id: "c1_02",
    category: "Modern Workplace",
    title: "Global Tech Hub Office",
    imageA: {
      type: "ai",
      label: "AI Neural Scene",
      visualType: "office_ai",
      description: "Background glass reflection shows floating geometric chairs, subtle text blur on monitor screen."
    },
    imageB: {
      type: "real",
      label: "Expo Office Floor",
      visualType: "office_real",
      description: "Natural depth of field, readable whiteboard markers, authentic office wire routing."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: look at the background glass reflection where chair legs merge floating into the floor.",
    difficulty: "Hard"
  },
  {
    id: "c1_03",
    category: "Architecture",
    title: "Futuristic Glass Skyscraper",
    imageA: {
      type: "real",
      label: "Metropolitan Tower",
      visualType: "building_real",
      description: "Real structural steel expansion joints, organic cloud reflections on double-glazed glass panels."
    },
    imageB: {
      type: "ai",
      label: "Procedural Architectural Render",
      visualType: "building_ai",
      description: "Window grid pattern breaks logic on 14th floor, balcony railings merge into glass facade."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: inspect the balcony railings on the right facade where structural lines randomly melt into windows.",
    difficulty: "Easy"
  },
  {
    id: "c1_04",
    category: "Gourmet Culinary",
    title: "Artisanal Coffee & Pastry",
    imageA: {
      type: "ai",
      label: "Latte Art Render",
      visualType: "food_ai",
      description: "Latte foam pattern swirls impossibly in a 3D loop, mug handle has no depth shadow."
    },
    imageB: {
      type: "real",
      label: "Café Photography",
      visualType: "food_real",
      description: "Natural air bubbles in espresso crema, wooden table grain with authentic wear patterns."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: the latte foam forms a mathematically impossible infinite loop swirl and lacks shadow depth.",
    difficulty: "Medium"
  },
  {
    id: "c1_05",
    category: "Wildlife & Nature",
    title: "Golden Eagle in Flight",
    imageA: {
      type: "real",
      label: "Telephoto Wildlife Shot",
      visualType: "nature_real",
      description: "Individual feather barb details, authentic motion blur on wingtips, natural sunlight refraction."
    },
    imageB: {
      type: "ai",
      label: "Deep Learning Avian Render",
      visualType: "nature_ai",
      description: "Secondary wing feathers overlap unnaturally with claw talons in mid-air physics."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: look closely at the wing underside feather structure blending into talon claws.",
    difficulty: "Hard"
  },
  {
    id: "c1_06",
    category: "Street Life",
    title: "Tokyo Rain Reflections",
    imageA: {
      type: "ai",
      label: "Synthetic Cyber Neon",
      visualType: "street_ai",
      description: "Japanese store sign characters are stylized pseudo-glyphs that do not form real words."
    },
    imageB: {
      type: "real",
      label: "Shibuya Night Photo",
      visualType: "street_real",
      description: "Authentic store Kanji signage, realistic puddle distortion and lens flare."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: the glowing store neon signage contains illegible AI pseudo-character glyphs.",
    difficulty: "Medium"
  },
  {
    id: "c1_07",
    category: "Automotive Tech",
    title: "Concept EV Supercar",
    imageA: {
      type: "real",
      label: "Motorsport Exhibition",
      visualType: "car_real",
      description: "Real brake caliper mounting pins, carbon fiber weave texture with directional light alignment."
    },
    imageB: {
      type: "ai",
      label: "Neural Vehicle Model",
      visualType: "car_ai",
      description: "Left side mirror stalk melts into the door trim; rim spokes have asymmetrical count."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: the side mirror mounting arm seamlessly fuses into the side window glass panel.",
    difficulty: "Easy"
  },
  {
    id: "c1_08",
    category: "Smart Hardware",
    title: "AI Chip & Motherboard",
    imageA: {
      type: "ai",
      label: "Silicon Diffusion Synthesis",
      visualType: "tech_ai",
      description: "Gold trace lines on PCB bridge together short-circuiting logic gates; heat sink fins misaligned."
    },
    imageB: {
      type: "real",
      label: "Cleanroom Semiconductor Macro",
      visualType: "tech_real",
      description: "Crisp micro-soldering joints, readable die etchings, standard surface-mount resistors."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: PCB copper trace lines randomly converge into solid blocks, violating electrical circuit logic.",
    difficulty: "Hard"
  },
  {
    id: "c1_09",
    category: "Fashion & Style",
    title: "High Fashion Runway",
    imageA: {
      type: "real",
      label: "Paris Fashion Week",
      visualType: "fashion_real",
      description: "Realistic fabric drape wrinkles, background photographers with distinct camera lenses."
    },
    imageB: {
      type: "ai",
      label: "Digital Avatar Couture",
      visualType: "fashion_ai",
      description: "Background audience faces blur into surreal smoothed features; ear accessory floats without lobe pin."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: background audience members have distorted merged facial features and floating earring jewelry.",
    difficulty: "Medium"
  },
  {
    id: "c1_10",
    category: "Pet & Domestic",
    title: "Golden Retriever Puppy",
    imageA: {
      type: "ai",
      label: "Neural Fur Generator",
      visualType: "animal_ai",
      description: "Fur near muzzle blends smoothly into nose leather without pore follicles; iris pupils have square corners."
    },
    imageB: {
      type: "real",
      label: "Pet Studio Photography",
      visualType: "animal_real",
      description: "Individual whiskers emerging from follicle roots, wet nose texture with natural lighting."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: the pupillary iris shape exhibits slight square artifacts around the edges under zoom.",
    difficulty: "Medium"
  },
  {
    id: "c1_11",
    category: "Smart City",
    title: "Solar Grid & Wind Farm",
    imageA: {
      type: "real",
      label: "Aerial Infrastructure",
      visualType: "energy_real",
      description: "Authentic power line pylons, solar panel reflection glare gradients, vehicle service tracks."
    },
    imageB: {
      type: "ai",
      label: "Synthetic Renewable City",
      visualType: "energy_ai",
      description: "Wind turbine blades have 4 blades on one tower and 3 on another; solar array rows overlap impossibly."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: check the background wind turbines—one generator inexplicably has four blades instead of three.",
    difficulty: "Easy"
  },
  {
    id: "c1_12",
    category: "Medical & Health",
    title: "Robotic Surgery Suite",
    imageA: {
      type: "ai",
      label: "MedTech Render",
      visualType: "medical_ai",
      description: "Surgical robotic arms lack articulation joints; overhead lamp LED arrays melt into ceiling tile."
    },
    imageB: {
      type: "real",
      label: "Hospital Operating Theatre",
      visualType: "medical_real",
      description: "Sterile stainless steel reflections, certified medical cable labeling, realistic monitor telemetry."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: the robotic arm lacks mechanical elbow pivot hinges and fuses directly into the ceiling.",
    difficulty: "Hard"
  },
  {
    id: "c1_13",
    category: "Travel & Landscape",
    title: "Alpine Lake Reflection",
    imageA: {
      type: "real",
      label: "Landscape Photography",
      visualType: "landscape_real",
      description: "Water ripple refraction dampens mountain peak reflection accurately; natural timber line."
    },
    imageB: {
      type: "ai",
      label: "Diffusion Scenic Render",
      visualType: "landscape_ai",
      description: "Water reflection shows snow-capped peaks that do not exist on the above mountain skyline."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: the lake water reflection displays extra mountain peaks not present in the sky above!",
    difficulty: "Medium"
  },
  {
    id: "c1_14",
    category: "Consumer Gadget",
    title: "Ergonomic Smartwatch",
    imageA: {
      type: "ai",
      label: "Product Mockup Synthesis",
      visualType: "watch_ai",
      description: "Watch strap buckle pin is mirrored on inside of wristband; digital screen font numbers merge."
    },
    imageB: {
      type: "real",
      label: "Product Studio Shot",
      visualType: "watch_real",
      description: "Clean OLED black levels, metallic bevel brushed texture, crisp sensor pod on back casing."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: digital watch UI numbers '12:45' bleed into each other, and strap pin is backwards.",
    difficulty: "Easy"
  },
  {
    id: "c1_15",
    category: "Cybersecurity",
    title: "Network Security Center",
    imageA: {
      type: "real",
      label: "SOC Control Room",
      visualType: "soc_real",
      description: "Authentic multi-monitor dash, real network metric graphs, operator ergonomic seating."
    },
    imageB: {
      type: "ai",
      label: "Cyber Command Render",
      visualType: "soc_ai",
      description: "Display wall shows fake glowing matrix code with floating disconnected glowing nodes."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: screen monitors feature nonsensical floating glowing matrix code without metric axes.",
    difficulty: "Medium"
  },
  {
    id: "c1_16",
    category: "Robotics",
    title: "Humanoid Service Robot",
    imageA: {
      type: "ai",
      label: "Generative Android Model",
      visualType: "robot_ai",
      description: "Right hand has six articulated fingers; chest LED panel displays non-symmetrical wiring."
    },
    imageB: {
      type: "real",
      label: "TCS Robotics Lab",
      visualType: "robot_real",
      description: "Standard industrial servo actuators, matte polymer chassis casing, real sensor array."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: look closely at the android's right hand—it has six distinct finger joints!",
    difficulty: "Easy"
  },
  {
    id: "c1_17",
    category: "Aerospace",
    title: "Commercial Jet Interior",
    imageA: {
      type: "real",
      label: "First Class Cabin Photo",
      visualType: "plane_real",
      description: "Consistent window row spacing, realistic overhead bin latch handles, seatbelt metal clasps."
    },
    imageB: {
      type: "ai",
      label: "Diffusion Flight Interior",
      visualType: "plane_ai",
      description: "Passenger window row on left side has elliptical windows, right side has square architectural windows."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: cabin window geometry is mismatched—elliptical on the left wall and square on the right.",
    difficulty: "Medium"
  },
  {
    id: "c1_18",
    category: "Industrial IoT",
    title: "Automated Fulfillment Center",
    imageA: {
      type: "ai",
      label: "Warehouse AI Visualization",
      visualType: "warehouse_ai",
      description: "Conveyor belt rollers run perpendicular on the left and diagonal on the right; packages float."
    },
    imageB: {
      type: "real",
      label: "Robotic Logistics Hub",
      visualType: "warehouse_real",
      description: "Barcoded bin containers, safety guard rails, industrial yellow floor hazard striping."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: conveyor belt roller directions clash midway and cardboard boxes hover off the track.",
    difficulty: "Hard"
  },
  {
    id: "c1_19",
    category: "Gaming & VR",
    title: "Haptics VR Headset",
    imageA: {
      type: "real",
      label: "Hardware Review Unit",
      visualType: "vr_real",
      description: "Interpupillary distance adjustment dial, braided USB-C cable, cushion foam stitching."
    },
    imageB: {
      type: "ai",
      label: "Generative XR Concept",
      visualType: "vr_ai",
      description: "Headset headstrap merges into the user's hair strands without a tightening clasp."
    },
    aiPosition: "B",
    explanation: "Image B is AI generated: the synthetic headstrap fabric physically blends directly into human hair fibers.",
    difficulty: "Medium"
  },
  {
    id: "c1_20",
    category: "Data Center",
    title: "Hyper-scale Server Facility",
    imageA: {
      type: "ai",
      label: "Neural Rack Model",
      visualType: "datacenter_ai",
      description: "Server rack status LED lights spell out random wave patterns; ethernet cables plug into blank metal panels."
    },
    imageB: {
      type: "real",
      label: "Cloud Server Hall",
      visualType: "datacenter_real",
      description: "Standard Cat6 blue patch cabling, server blade handle latches, cold-aisle containment panels."
    },
    aiPosition: "A",
    explanation: "Image A is AI generated: patch cables terminate into solid metal server faceplates without RJ45 ports.",
    difficulty: "Hard"
  }
];
