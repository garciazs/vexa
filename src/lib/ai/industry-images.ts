/** Fotos realistas por nicho — Unsplash curadas para parecer site feito à mão */

export type Industry =
  | "barbearia"
  | "salon"
  | "restaurante"
  | "cafe"
  | "clinica"
  | "estetica"
  | "gym"
  | "dentista"
  | "petshop"
  | "hotel"
  | "imobiliaria"
  | "padaria"
  | "pizza"
  | "advocacia"
  | "florista"
  | "automotivo"
  | "escola"
  | "saas"
  | "coaching"
  | "agency"
  | "webinar"
  | "ecommerce"
  | "generic";

export interface ImagePack {
  hero: string;
  features: [string, string, string];
  gallery: [string, string, string, string];
  form: string;
  cta: string;
  avatars: [string, string, string];
}

const u = (id: string, w = 1920) =>
  `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;

const PACKS: Record<Industry, ImagePack> = {
  barbearia: {
    hero: u("photo-1503951914875-452162b0f3f1"),
    features: [
      u("photo-1622286342621-4bd786c2447c", 800),
      u("photo-1585747860715-073ca85ba9e0", 800),
      u("photo-1599351431202-1e0f0137899a", 800),
    ],
    gallery: [
      u("photo-1593702275816-e539f9d19a0b", 800),
      u("photo-1621605815971-fbc98d665033", 800),
      u("photo-1507003211169-0a1dd7228f2d", 800),
      u("photo-1622286342621-4bd786c2447c", 800),
    ],
    form: u("photo-1585747860715-073ca85ba9e0", 1200),
    cta: u("photo-1503951914875-452162b0f3f1", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1500648767791-00dcc994a43e", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
    ],
  },
  salon: {
    hero: u("photo-1560066984-138dadb4c035"),
    features: [
      u("photo-1522337360788-8b13dee7a37e", 800),
      u("photo-1633681928666-f072aa2c5466", 800),
      u("photo-1519699047748-de8e457a634e", 800),
    ],
    gallery: [
      u("photo-1521590832167-bc7e6f33102b", 800),
      u("photo-1562322140-8baeececf3df", 800),
      u("photo-1522337360788-8b13dee7a37e", 800),
      u("photo-1633681928666-f072aa2c5466", 800),
    ],
    form: u("photo-1560066984-138dadb4c035", 1200),
    cta: u("photo-1522337360788-8b13dee7a37e", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1534528741775-53994a69daeb", 200),
    ],
  },
  restaurante: {
    hero: u("photo-1517248135467-4c7edcad34c4"),
    features: [
      u("photo-1414235077428-338989a2e8c0", 800),
      u("photo-1559339352-11d035aa65de", 800),
      u("photo-1552566626-52f8b828add9", 800),
    ],
    gallery: [
      u("photo-1544025162-d76694265947", 800),
      u("photo-1504674900247-0877df9cc836", 800),
      u("photo-1551218808-94e220e084d2", 800),
      u("photo-1559339352-11d035aa65de", 800),
    ],
    form: u("photo-1517248135467-4c7edcad34c4", 1200),
    cta: u("photo-1414235077428-338989a2e8c0", 1200),
    avatars: [
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
  cafe: {
    hero: u("photo-1495474472287-4d776b657a2e"),
    features: [
      u("photo-1509048191080-d2984bad6ae5", 800),
      u("photo-1442512595331-e89e73853f31", 800),
      u("photo-1511920170033-f8396924c348", 800),
    ],
    gallery: [
      u("photo-1509048191080-d2984bad6ae5", 800),
      u("photo-1442512595331-e89e73853f31", 800),
      u("photo-1495474472287-4d776b657a2e", 800),
      u("photo-1511920170033-f8396924c348", 800),
    ],
    form: u("photo-1495474472287-4d776b657a2e", 1200),
    cta: u("photo-1509048191080-d2984bad6ae5", 1200),
    avatars: [
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
    ],
  },
  clinica: {
    hero: u("photo-1519494026892-80bbd2d6fd0d"),
    features: [
      u("photo-1579684385127-1ef15d508118", 800),
      u("photo-1631217868264-e5b90bb5e213", 800),
      u("photo-1586773866628-47b0b3299a5c", 800),
    ],
    gallery: [
      u("photo-1519494026892-80bbd2d6fd0d", 800),
      u("photo-1579684385127-1ef15d508118", 800),
      u("photo-1631217868264-e5b90bb5e213", 800),
      u("photo-1586773866628-47b0b3299a5c", 800),
    ],
    form: u("photo-1519494026892-80bbd2d6fd0d", 1200),
    cta: u("photo-1579684385127-1ef15d508118", 1200),
    avatars: [
      u("photo-1559839734-2b71ea197ec2", 200),
      u("photo-1612349317150-e413f6a5b16d", 200),
      u("photo-1594824476967-48c8b964273f", 200),
    ],
  },
  estetica: {
    hero: u("photo-1570172619644-dfd955edae04"),
    features: [
      u("photo-1515377909083-10a13a3a7a4e", 800),
      u("photo-1616394584738-fc6e612e71b9", 800),
      u("photo-1570172619644-dfd955edae04", 800),
    ],
    gallery: [
      u("photo-1515377909083-10a13a3a7a4e", 800),
      u("photo-1616394584738-fc6e612e71b9", 800),
      u("photo-1570172619644-dfd955edae04", 800),
      u("photo-1522337360788-8b13dee7a37e", 800),
    ],
    form: u("photo-1570172619644-dfd955edae04", 1200),
    cta: u("photo-1515377909083-10a13a3a7a4e", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1534528741775-53994a69daeb", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
    ],
  },
  gym: {
    hero: u("photo-1534438327276-14e5300c3a48"),
    features: [
      u("photo-1571902943202-7cf4e4a9780f", 800),
      u("photo-1540497077202-7c91a5ac0c6", 800),
      u("photo-1517836357463-d25dfeac3438", 800),
    ],
    gallery: [
      u("photo-1534438327276-14e5300c3a48", 800),
      u("photo-1571902943202-7cf4e4a9780f", 800),
      u("photo-1540497077202-7c91a5ac0c6", 800),
      u("photo-1517836357463-d25dfeac3438", 800),
    ],
    form: u("photo-1534438327276-14e5300c3a48", 1200),
    cta: u("photo-1571902943202-7cf4e4a9780f", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1500648767791-00dcc994a43e", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
    ],
  },
  dentista: {
    hero: u("photo-1629909613654-28e377c37b09"),
    features: [
      u("photo-1606811971610-448588d57f5b", 800),
      u("photo-1609840114035-3c981b782dfe", 800),
      u("photo-1588776814546-1ffcf47267a5", 800),
    ],
    gallery: [
      u("photo-1629909613654-28e377c37b09", 800),
      u("photo-1606811971610-448588d57f5b", 800),
      u("photo-1609840114035-3c981b782dfe", 800),
      u("photo-1588776814546-1ffcf47267a5", 800),
    ],
    form: u("photo-1629909613654-28e377c37b09", 1200),
    cta: u("photo-1606811971610-448588d57f5b", 1200),
    avatars: [
      u("photo-1612349317150-e413f6a5b16d", 200),
      u("photo-1559839734-2b71ea197ec2", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
    ],
  },
  petshop: {
    hero: u("photo-1450778868580-41d644091972"),
    features: [
      u("photo-1587300003388-59208cc962cb", 800),
      u("photo-1516734212186-a967f81ad9d7", 800),
      u("photo-1530281700549-e82e7baa0a7f", 800),
    ],
    gallery: [
      u("photo-1450778868580-41d644091972", 800),
      u("photo-1587300003388-59208cc962cb", 800),
      u("photo-1516734212186-a967f81ad9d7", 800),
      u("photo-1530281700549-e82e7baa0a7f", 800),
    ],
    form: u("photo-1450778868580-41d644091972", 1200),
    cta: u("photo-1587300003388-59208cc962cb", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
    ],
  },
  hotel: {
    hero: u("photo-1566073771259-6a8506099945"),
    features: [
      u("photo-1631049307264-da0ec9d70304", 800),
      u("photo-1582719478250-c89cae4dc85b", 800),
      u("photo-1578683010236-d716f9a3f461", 800),
    ],
    gallery: [
      u("photo-1566073771259-6a8506099945", 800),
      u("photo-1631049307264-da0ec9d70304", 800),
      u("photo-1582719478250-c89cae4dc85b", 800),
      u("photo-1578683010236-d716f9a3f461", 800),
    ],
    form: u("photo-1566073771259-6a8506099945", 1200),
    cta: u("photo-1631049307264-da0ec9d70304", 1200),
    avatars: [
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
  imobiliaria: {
    hero: u("photo-1560518883-ce09059eeffa"),
    features: [
      u("photo-1600596542815-ffad7257040b", 800),
      u("photo-1600607687939-ce8a6c25118c", 800),
      u("photo-1600566753190-17f0baa8517a", 800),
    ],
    gallery: [
      u("photo-1560518883-ce09059eeffa", 800),
      u("photo-1600596542815-ffad7257040b", 800),
      u("photo-1600607687939-ce8a6c25118c", 800),
      u("photo-1600566753190-17f0baa8517a", 800),
    ],
    form: u("photo-1560518883-ce09059eeffa", 1200),
    cta: u("photo-1600596542815-ffad7257040b", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
    ],
  },
  padaria: {
    hero: u("photo-1509440159596-0249088772ff"),
    features: [
      u("photo-1555507036-ab1f4038808a", 800),
      u("photo-1486427944299-d1955d23e34d", 800),
      u("photo-1517433670217-36bd9f6e3fbf", 800),
    ],
    gallery: [
      u("photo-1509440159596-0249088772ff", 800),
      u("photo-1555507036-ab1f4038808a", 800),
      u("photo-1486427944299-d1955d23e34d", 800),
      u("photo-1517433670217-36bd9f6e3fbf", 800),
    ],
    form: u("photo-1509440159596-0249088772ff", 1200),
    cta: u("photo-1555507036-ab1f4038808a", 1200),
    avatars: [
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
    ],
  },
  pizza: {
    hero: u("photo-1513104890138-7c749659a591"),
    features: [
      u("photo-1574071318508-1cdbab80d002", 800),
      u("photo-1565299624946-b28f40a0ae38", 800),
      u("photo-1571997478779-383279a01277", 800),
    ],
    gallery: [
      u("photo-1513104890138-7c749659a591", 800),
      u("photo-1574071318508-1cdbab80d002", 800),
      u("photo-1565299624946-b28f40a0ae38", 800),
      u("photo-1571997478779-383279a01277", 800),
    ],
    form: u("photo-1513104890138-7c749659a591", 1200),
    cta: u("photo-1574071318508-1cdbab80d002", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
    ],
  },
  advocacia: {
    hero: u("photo-1589829545855-d5d0d0f1f7a0"),
    features: [
      u("photo-1450101499163-c8848c66ca85", 800),
      u("photo-1589391886645-519ed5a2c2cf", 800),
      u("photo-1507679799987-c73779587ccf", 800),
    ],
    gallery: [
      u("photo-1589829545855-d5d0d0f1f7a0", 800),
      u("photo-1450101499163-c8848c66ca85", 800),
      u("photo-1589391886645-519ed5a2c2cf", 800),
      u("photo-1507679799987-c73779587ccf", 800),
    ],
    form: u("photo-1589829545855-d5d0d0f1f7a0", 1200),
    cta: u("photo-1450101499163-c8848c66ca85", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1560250097-0b93528c311a", 200),
    ],
  },
  florista: {
    hero: u("photo-1487073353326-b7e66e9a7cfe"),
    features: [
      u("photo-1490759846238-558e3546525f", 800),
      u("photo-1561181286-d1822b58d272", 800),
      u("photo-1518895949257-7621f3c4d55f", 800),
    ],
    gallery: [
      u("photo-1487073353326-b7e66e9a7cfe", 800),
      u("photo-1490759846238-558e3546525f", 800),
      u("photo-1561181286-d1822b58d272", 800),
      u("photo-1518895949257-7621f3c4d55f", 800),
    ],
    form: u("photo-1487073353326-b7e66e9a7cfe", 1200),
    cta: u("photo-1490759846238-558e3546525f", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1534528741775-53994a69daeb", 200),
    ],
  },
  automotivo: {
    hero: u("photo-1486262715619-67b85e0b08d3"),
    features: [
      u("photo-1625047509168-a7026f36de79", 800),
      u("photo-1492144534655-ae79c964c9d7", 800),
      u("photo-1619642751034-765df036d329", 800),
    ],
    gallery: [
      u("photo-1486262715619-67b85e0b08d3", 800),
      u("photo-1625047509168-a7026f36de79", 800),
      u("photo-1492144534655-ae79c964c9d7", 800),
      u("photo-1619642751034-765df036d329", 800),
    ],
    form: u("photo-1486262715619-67b85e0b08d3", 1200),
    cta: u("photo-1625047509168-a7026f36de79", 1200),
    avatars: [
      u("photo-1500648767791-00dcc994a43e", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
  escola: {
    hero: u("photo-1523050854058-8df90110c9f1"),
    features: [
      u("photo-1503676260728-1c00da094a0b", 800),
      u("photo-1427504499543-839f219ce2d5", 800),
      u("photo-1524178232363-1fb2b075b655", 800),
    ],
    gallery: [
      u("photo-1523050854058-8df90110c9f1", 800),
      u("photo-1503676260728-1c00da094a0b", 800),
      u("photo-1427504499543-839f219ce2d5", 800),
      u("photo-1524178232363-1fb2b075b655", 800),
    ],
    form: u("photo-1523050854058-8df90110c9f1", 1200),
    cta: u("photo-1503676260728-1c00da094a0b", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
    ],
  },
  saas: {
    hero: u("photo-1451187580459-43490279c0fa"),
    features: [
      u("photo-1551288049-bebda4e38f71", 800),
      u("photo-1460925895917-afdab827c52f", 800),
      u("photo-1553877522-43269d4ea984", 800),
    ],
    gallery: [
      u("photo-1551434678-e076c223a692", 800),
      u("photo-1522071820081-009f0129c71c", 800),
      u("photo-1600880292203-757bb62b4baf", 800),
      u("photo-1556760543-740958af8cc0", 800),
    ],
    form: u("photo-1618005182384-a83a8bd57fbe", 1200),
    cta: u("photo-1557804506-669a67965ba0", 1200),
    avatars: [
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
  coaching: {
    hero: u("photo-1521737711867-e3b97375f902"),
    features: [
      u("photo-1552664730-d307ca884978", 800),
      u("photo-1517245386807-bb43f82c33c4", 800),
      u("photo-1556761175-5973dc0f32e7", 800),
    ],
    gallery: [
      u("photo-1521737711867-e3b97375f902", 800),
      u("photo-1552664730-d307ca884978", 800),
      u("photo-1517245386807-bb43f82c33c4", 800),
      u("photo-1556761175-5973dc0f32e7", 800),
    ],
    form: u("photo-1521737711867-e3b97375f902", 1200),
    cta: u("photo-1552664730-d307ca884978", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
    ],
  },
  agency: {
    hero: u("photo-1497366216548-37526070297c"),
    features: [
      u("photo-1600880292203-757bb62b4baf", 800),
      u("photo-1553877522-43269d4ea984", 800),
      u("photo-1522071820081-009f0129c71c", 800),
    ],
    gallery: [
      u("photo-1497366216548-37526070297c", 800),
      u("photo-1600880292203-757bb62b4baf", 800),
      u("photo-1553877522-43269d4ea984", 800),
      u("photo-1522071820081-009f0129c71c", 800),
    ],
    form: u("photo-1497366216548-37526070297c", 1200),
    cta: u("photo-1557804506-669a67965ba0", 1200),
    avatars: [
      u("photo-1507003211169-0a1dd7228f2d", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1560250097-0b93528c311a", 200),
    ],
  },
  webinar: {
    hero: u("photo-1540575467063-178a50c2df87"),
    features: [
      u("photo-1611162616305-c69b3fa7a132", 800),
      u("photo-1552664730-d307ca884978", 800),
      u("photo-1517245386807-bb43f82c33c4", 800),
    ],
    gallery: [
      u("photo-1540575467063-178a50c2df87", 800),
      u("photo-1611162616305-c69b3fa7a132", 800),
      u("photo-1552664730-d307ca884978", 800),
      u("photo-1517245386807-bb43f82c33c4", 800),
    ],
    form: u("photo-1540575467063-178a50c2df87", 1200),
    cta: u("photo-1611162616305-c69b3fa7a132", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
  ecommerce: {
    hero: u("photo-1441986300917-64674bd600d8"),
    features: [
      u("photo-1472851294608-062f824d29cc", 800),
      u("photo-1523275335684-37898b6baf30", 800),
      u("photo-1484101403633-56289189fc92", 800),
    ],
    gallery: [
      u("photo-1441986300917-64674bd600d8", 800),
      u("photo-1472851294608-062f824d29cc", 800),
      u("photo-1523275335684-37898b6baf30", 800),
      u("photo-1484101403633-56289189fc92", 800),
    ],
    form: u("photo-1441986300917-64674bd600d8", 1200),
    cta: u("photo-1472851294608-062f824d29cc", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1438761681033-6461ffad8d80", 200),
      u("photo-1534528741775-53994a69daeb", 200),
    ],
  },
  generic: {
    hero: u("photo-1557804506-669a67965ba0"),
    features: [
      u("photo-1556761175-5973dc0f32e7", 800),
      u("photo-1553877522-43269d4ea984", 800),
      u("photo-1551288049-bebda4e38f71", 800),
    ],
    gallery: [
      u("photo-1600880292203-757bb62b4baf", 800),
      u("photo-1522071820081-009f0129c71c", 800),
      u("photo-1556760543-740958af8cc0", 800),
      u("photo-1553877522-43269d4ea984", 800),
    ],
    form: u("photo-1618005182384-a83a8bd57fbe", 1200),
    cta: u("photo-1557804506-669a67965ba0", 1200),
    avatars: [
      u("photo-1494790108377-be9c29b29330", 200),
      u("photo-1472099645785-5658abf4ff4e", 200),
      u("photo-1507003211169-0a1dd7228f2d", 200),
    ],
  },
};

const INDUSTRY_RULES: { industry: Industry; pattern: RegExp }[] = [
  { industry: "barbearia", pattern: /barbearia|barbeiro|barber|barbershop|corte masculino|fade|navalha/ },
  { industry: "salon", pattern: /salão|salao|cabeleireir|hair|beleza feminina|manicure|unhas/ },
  { industry: "pizza", pattern: /pizzaria|pizza|forno a lenha/ },
  { industry: "padaria", pattern: /padaria|pastelaria|confeitaria|pão artesanal|bolo/ },
  { industry: "restaurante", pattern: /restaurante|jantar|almoço|chef|menu|gastronomia|sushi|hamburgueria/ },
  { industry: "cafe", pattern: /café|cafeteria|coffee|brunch/ },
  { industry: "estetica", pattern: /estética|estetica|spa|peeling|botox|depilação|skincare/ },
  { industry: "clinica", pattern: /clínica|clinica|médic|medic|saúde|saude|fisioterapia/ },
  { industry: "dentista", pattern: /dentista|odontolog|ortodont|clareamento dental/ },
  { industry: "gym", pattern: /ginásio|ginasio|academia|fitness|crossfit|personal trainer|musculação/ },
  { industry: "petshop", pattern: /pet\s*shop|veterin|banho e tosa|animais|pet store/ },
  { industry: "hotel", pattern: /hotel|pousada|hostel|hospedagem|resort/ },
  { industry: "imobiliaria", pattern: /imobiliária|imobiliaria|apartamento|imóvel|imovel|corretor/ },
  { industry: "advocacia", pattern: /advocacia|advogado|escritório jurídico|direito/ },
  { industry: "florista", pattern: /florista|flores|buquê|buque|casamento floral/ },
  { industry: "automotivo", pattern: /oficina|mecânica|mecanica|auto center|detailing|car wash/ },
  { industry: "escola", pattern: /escola|curso|formação|formacao|educação|educacao|aulas/ },
  { industry: "saas", pattern: /saas|software|app|plataforma|startup|tech|api|cloud/ },
  { industry: "coaching", pattern: /mentoria|coaching|programa|masterclass|high ticket/ },
  { industry: "agency", pattern: /agência|agencia|marketing|consultoria|freelancer|design studio/ },
  { industry: "webinar", pattern: /webinar|evento|live|ao vivo|palestra/ },
  { industry: "ecommerce", pattern: /loja|ecommerce|e-commerce|shop|moda|artesanal|vender online/ },
];

export function detectIndustry(prompt: string): Industry {
  const p = prompt.toLowerCase();
  for (const { industry, pattern } of INDUSTRY_RULES) {
    if (pattern.test(p)) return industry;
  }
  return "generic";
}

export function getIndustryImages(industry: Industry): ImagePack {
  return PACKS[industry];
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  barbearia: "Barbearia",
  salon: "Salão de beleza",
  restaurante: "Restaurante",
  cafe: "Café",
  clinica: "Clínica",
  estetica: "Estética",
  gym: "Fitness",
  dentista: "Dentista",
  petshop: "Pet shop",
  hotel: "Hotel",
  imobiliaria: "Imobiliária",
  padaria: "Padaria",
  pizza: "Pizzaria",
  advocacia: "Advocacia",
  florista: "Florista",
  automotivo: "Automotivo",
  escola: "Educação",
  saas: "SaaS",
  coaching: "Mentoria",
  agency: "Agência",
  webinar: "Webinar",
  ecommerce: "E-commerce",
  generic: "Negócio",
};

export function isLocalBusiness(industry: Industry): boolean {
  return [
    "barbearia",
    "salon",
    "restaurante",
    "cafe",
    "clinica",
    "estetica",
    "gym",
    "dentista",
    "petshop",
    "hotel",
    "padaria",
    "pizza",
    "florista",
    "automotivo",
  ].includes(industry);
}
