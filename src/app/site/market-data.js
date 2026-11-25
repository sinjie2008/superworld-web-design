import consumer from "../../data/applications/consumer.json";
import healthcare from "../../data/applications/healthcare.json";
import industrial from "../../data/applications/industrial.json";
import smartHome from "../../data/applications/smart-home.json";
import seriesReferences from "../../data/applications/series-references.json";

export { seriesReferences };

export const applicationMarkets = [consumer, healthcare, industrial, smartHome];
export const marketHref = (market) => "/applications/" + market.id;
export const findMarket = (pathname) =>
  applicationMarkets.find((market) => marketHref(market) === pathname);

export const marketFitId = (market) => {
  const name = market.id.replaceAll("-", "_");
  return (
    "superworld_electronics_applications_" + name + "_find_the_right_series_by_" + name + "_system"
  );
};

export const systemHref = (market, system) =>
  marketHref(market) + "?system=" + system.id + "#" + marketFitId(market);

export const publishedSeriesPaths = new Set(
  applicationMarkets.flatMap((market) =>
    market.systems.flatMap((system) =>
      system.modules.flatMap((block) => block.mappings.flatMap((mapping) => mapping.series)),
    ),
  ),
);

export const marketIllustrations = {
  speakers: {
    path: "/assets/applications/consumer/speakers-exploded-view.webp",
    alt: "Exploded view of the Boombot REX portable speaker showing dual drivers and a passive radiator",
    width: 1920,
    height: 1080,
    title: "Boombot REX portable speaker",
    creator: "LiefStorer1",
    source: "https://commons.wikimedia.org/wiki/File:BoombotREX_Exploded_Blue.png",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "resized and shown in grayscale",
    hotspots: [
      { blockId: "speaker-headphone-microphone", x: 44.2, y: 52.7, label: "Loudspeaker driver" },
    ],
  },
  hearables: {
    path: "/assets/applications/consumer/hearables-board-disassembly.webp",
    alt: "Removed SoundPeats TrueBuds earpiece board showing the Bluetooth chip at its centre",
    width: 1440,
    height: 810,
    title: "SoundPeats TrueBuds earpiece circuit board",
    creator: "© Raimond Spekking",
    sourcePublisher: "via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:SoundPeats_TrueBuds_-_ear_bud_-_board-9742.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "resized and converted to grayscale WebP",
    hotspots: [
      {
        blockId: "connectivity", x: 58, y: 56, label: "Bluetooth system-on-chip",
        labelPosition: { x: 68, y: 32 },
      },
    ],
  },
  uav: {
    path: "/assets/applications/consumer/uav-camera-disassembly.webp",
    alt: "Removed Simulus NX-9274-675 quadcopter camera module showing its lens, flexible cable and circuit board",
    width: 1440,
    height: 810,
    title: "Simulus NX-9274-675 quadcopter camera assembly",
    creator: "© Raimond Spekking",
    sourcePublisher: "via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Simulus_NX-9274-675_-_camera_module-3275.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "resized and converted to grayscale WebP",
    hotspots: [
      {
        blockId: "camera", x: 5.9, y: 54.1, label: "Camera lens assembly",
        labelPosition: { x: 24, y: 30 },
      },
    ],
  },
  "air-purifier": {
    path: "/assets/applications/consumer/air-purifier-control-assembly.webp",
    alt: "Prototype air purifier and open control assembly with its Arduino Uno board labelled",
    width: 666,
    height: 408,
    title: "Prototype air purifier and control assembly",
    creator: "Ananti Afnan Ahona et al.",
    sourcePublisher: "SciEn Conference Series: Engineering, Figure 2",
    source: "https://doi.org/10.38032/scse.2025.3.120",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    changes: "figure converted to grayscale WebP",
    hotspots: [
      {
        blockId: "cpu", x: 69, y: 29, label: "Arduino Uno control board",
        labelPosition: { x: 79, y: 42 },
      },
    ],
  },
  "blood-pressure": {
    path: "/assets/applications/healthcare/blood-pressure-cuff-disassembly.webp",
    alt: "Opened Boso medicus control upper-arm cuff monitor showing its LCD, circuit board and pressure tubing",
    width: 1440,
    height: 1085,
    title: "Boso medicus control cuff monitor with its case open",
    creator: "© Raimond Spekking",
    sourcePublisher: "via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:Boso_medicus_control_-_case_opened-9638.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "resized and converted to grayscale WebP",
    context: "Wireless connectivity and charging are circuit options for other device designs.",
    hotspots: [
      { blockId: "display-panel", x: 35.8, y: 39.7, label: "LCD display assembly" },
    ],
  },
  thermometer: {
    path: "/assets/applications/healthcare/thermometer-display-disassembly.webp",
    alt: "Disassembled MicroLife Maximumthermometer 8001 circuit board with its LCD still attached",
    width: 1440,
    height: 810,
    title: "MicroLife Maximumthermometer 8001 display board",
    creator: "© Raimond Spekking",
    sourcePublisher: "via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:MicroLife_Medical_Science_Europe_Maximumthermometer_8001_-_board_with_display-9881.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "resized and converted to grayscale WebP",
    context: "This internal assembly view shows the LCD and its circuit board.",
    hotspots: [
      { blockId: "display-panel", x: 30.9, y: 48.8, label: "LCD display" },
    ],
  },
  "industrial-robots": {
    path: "/assets/applications/industrial/kuka-controller-cabinet.webp",
    alt: "Open KUKA RC 40/20 industrial robot controller cabinet showing its controller modules and axis drives",
    width: 1080,
    height: 1440,
    title: "KUKA RC 40/20 robot controller cabinet interior",
    creator: "Mixabest",
    sourcePublisher: "via Wikimedia Commons",
    source: "https://commons.wikimedia.org/wiki/File:KUKA_Industrieroboter_IR_161_60_mit_RC_40_20_005.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "resized and converted to grayscale WebP",
    context: "The open cabinet shows the Siemens controller assembly above the six axis drives.",
  },
  "3d-printers": {
    path: "/assets/applications/industrial/3d-printers-exploded-view.webp",
    alt: "Exploded view of the OLSK Small 3D Printer V3 showing the enclosure, motion frame, print bed, motor drivers and power supplies",
    width: 1800,
    height: 1240,
    title: "OLSK Small 3D Printer V3",
    creator: "Daniele Ingrassia (InMachines Ingrassia GmbH) and Tobias Redlich (Helmut-Schmidt-Universität/Universität der Bundeswehr Hamburg)",
    source: "https://github.com/Open-Lab-Starter-Kit/OLSK-Small-3D-Printer/blob/b14a5f8cfd854fae0ee94a4612eeb78be49f5710/Assembly_Manual/public/OLSK_Small_3DPrinter_V3_All_In.glb",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "exploded arrangement and grayscale rendering of the original assembly model",
    hotspots: [
      {
        blockId: "motor-driver", x: 77.1, y: 52.67, label: "Stepper motor driver module",
        labelPosition: { x: 76, y: 44 },
      },
      {
        blockId: "power-supply", x: 68.51, y: 75.41, label: "Power supply unit",
        labelPosition: { x: 69, y: 86 },
      },
    ],
  },
  "security-products": {
    path: "/assets/applications/industrial/security-camera-disassembly.webp",
    alt: "Opened security camera with separated cover and the optical module visible on the circuit board",
    width: 1440,
    height: 1043,
    title: "Disassembled security camera",
    creator: "Dmitry G",
    source: "https://commons.wikimedia.org/wiki/File:Disassembled_security_camera.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "resized and converted to grayscale WebP",
    hotspots: [
      {
        blockId: "camera-module", x: 51, y: 53, label: "Camera optical module",
        labelPosition: { x: 61, y: 38 },
      },
    ],
  },
  "smart-meter": {
    path: "/assets/applications/industrial/openzmeter-assembly.webp",
    alt: "OpenZmeter smart electricity meter prototype with the circuit board, battery and identifiable AC-DC converter",
    width: 1307,
    height: 1440,
    title: "OpenZmeter internal assembly",
    creator: "Eduardo Viciana et al.",
    sourcePublisher: "Sustainability, Figure 1b",
    source: "https://doi.org/10.3390/su10114038",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    changes: "photo isolated from Figure 1 and converted to grayscale WebP",
    hotspots: [
      {
        blockId: "ac-dc-converter", x: 22, y: 40, label: "Packaged AC-DC converter",
        labelPosition: { x: 38, y: 23 },
      },
    ],
  },
  "led-lighting": {
    path: "/assets/applications/industrial/led-lighting-exploded-view.webp",
    alt: "SMARTlight 606999 lamp disassembled into its base contact, threaded shell, driver board and LED filament envelope",
    width: 1920,
    height: 1070,
    title: "SMARTlight 606999 LED lamp",
    creator: "Dmitry G",
    source: "https://commons.wikimedia.org/wiki/File:SMARTlight_606999.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "cropped, resized and shown in grayscale",
    hotspots: [
      {
        blockId: "ac-power", x: 20.5, y: 55.6, label: "AC input screw base",
        labelPosition: { x: 20.5, y: 36 },
      },
      {
        blockId: "ac-dc-converter", x: 42.9, y: 62.9, label: "LED driver board",
        labelPosition: { x: 42.9, y: 39 },
      },
    ],
  },
  thermostat: {
    path: "/assets/applications/smart-home/thermostat-disassembly.webp",
    alt: "First-generation Nest Learning Thermostat disassembled into its front ring, housing with a ribbon connector, and head unit with the circuit board and battery",
    width: 600,
    height: 524,
    title: "First-generation Nest Learning Thermostat disassembly",
    creator: "Nathan Seidle / SparkFun Electronics",
    source: "https://learn.sparkfun.com/tutorials/nest-thermostat-teardown-/all.pdf#page=7",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    changes: "converted to grayscale WebP",
    hotspots: [
      {
        blockId: "interface", x: 15.5, y: 54.6, label: "Housing ribbon connector",
        labelPosition: { x: 27, y: 47 },
      },
    ],
  },
  "coffee-machine": {
    path: "/assets/applications/smart-home/coffee-machine-control-assembly.webp",
    alt: "diyPresso Two assembly illustration showing the control circuit board mounted on the electronics panel",
    width: 1258,
    height: 1216,
    title: "diyPresso Two electronics panel assembly",
    creator: "diyPresso B.V.",
    source: "https://www.diypresso.com/wp-content/uploads/2026/10/diyPresso-Two-V1.1.2-Assembly-Manual.pdf#page=38",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    changes: "step 2 drawing cropped and rendered as grayscale WebP",
    hotspots: [
      {
        blockId: "intelligent-control-board", x: 34, y: 56.5, label: "Mounted control circuit board",
        labelPosition: { x: 58, y: 50 },
      },
    ],
  },
};
