/**
 * Localized display labels for canonical enum values. The database always stores
 * the English UPPER_SNAKE value; this maps them to user-facing text per locale.
 * Missing entries fall back to a humanized English label.
 */
import type { Locale } from "./index";
import { humanizeEnum } from "@/lib/utils";

type LabelMap = Record<string, Partial<Record<Locale, string>>>;

const LABELS: LabelMap = {
  // Roles
  ADMIN: { en: "Administrator", hi: "प्रशासक", gu: "સંચાલક" },
  ROAD_OFFICER: { en: "Road Officer", hi: "सड़क अधिकारी", gu: "માર્ગ અધિકારી" },
  FIELD_INSPECTOR: { en: "Field Inspector", hi: "क्षेत्र निरीक्षक", gu: "ક્ષેત્ર નિરીક્ષક" },
  // User status
  ACTIVE: { en: "Active", hi: "सक्रिय", gu: "સક્રિય" },
  INACTIVE: { en: "Inactive", hi: "निष्क्रिय", gu: "નિષ્ક્રિય" },
  // Project status
  DRAFT: { en: "Draft", hi: "मसौदा", gu: "ડ્રાફ્ટ" },
  SUBMITTED: { en: "Submitted", hi: "जमा किया गया", gu: "સબમિટ કર્યું" },
  UNDER_REVIEW: { en: "Under Review", hi: "समीक्षाधीन", gu: "સમીક્ષા હેઠળ" },
  APPROVED: { en: "Approved", hi: "स्वीकृत", gu: "મંજૂર" },
  BUDGET_APPROVED: { en: "Budget Approved", hi: "बजट स्वीकृत", gu: "બજેટ મંજૂર" },
  TENDERING: { en: "Tendering", hi: "निविदा प्रक्रिया", gu: "ટેન્ડરિંગ" },
  CONTRACTOR_SELECTED: { en: "Contractor Selected", hi: "ठेकेदार चयनित", gu: "કોન્ટ્રાક્ટર પસંદ" },
  WORK_ORDER_ISSUED: { en: "Work Order Issued", hi: "कार्य आदेश जारी", gu: "કાર્ય આદેશ જારી" },
  UNDER_CONSTRUCTION: { en: "Under Construction", hi: "निर्माणाधीन", gu: "બાંધકામ હેઠળ" },
  COMPLETED: { en: "Completed", hi: "पूर्ण", gu: "પૂર્ણ" },
  HANDED_OVER: { en: "Handed Over", hi: "सौंप दिया गया", gu: "સોંપાયું" },
  CANCELLED: { en: "Cancelled", hi: "रद्द", gu: "રદ" },
  // Conditions & priority
  GOOD: { en: "Good", hi: "अच्छी", gu: "સારી" },
  MODERATE: { en: "Moderate", hi: "मध्यम", gu: "મધ્યમ" },
  POOR: { en: "Poor", hi: "खराब", gu: "ખરાબ" },
  CRITICAL: { en: "Critical", hi: "गंभीर", gu: "ગંભીર" },
  LOW: { en: "Low", hi: "कम", gu: "ઓછી" },
  MEDIUM: { en: "Medium", hi: "मध्यम", gu: "મધ્યમ" },
  HIGH: { en: "High", hi: "उच्च", gu: "ઊંચી" },
  // Road status
  OPERATIONAL: { en: "Operational", hi: "परिचालन में", gu: "કાર્યરત" },
  UNDER_MAINTENANCE: { en: "Under Maintenance", hi: "रखरखाव में", gu: "જાળવણી હેઠળ" },
  CLOSED: { en: "Closed", hi: "बंद", gu: "બંધ" },
  // Tender/bid/contract
  OPEN: { en: "Open", hi: "खुला", gu: "ખુલ્લું" },
  EVALUATION: { en: "Evaluation", hi: "मूल्यांकन", gu: "મૂલ્યાંકન" },
  AWARDED: { en: "Awarded", hi: "प्रदत्त", gu: "એનાયત" },
  UNDER_REVIEW_BID: { en: "Under Review", hi: "समीक्षाधीन", gu: "સમીક્ષા હેઠળ" },
  ACCEPTED: { en: "Accepted", hi: "स्वीकृत", gu: "સ્વીકૃત" },
  REJECTED: { en: "Rejected", hi: "अस्वीकृत", gu: "નકારેલ" },
  BLACKLISTED: { en: "Blacklisted", hi: "काली सूची", gu: "બ્લેકલિસ્ટ" },
  TERMINATED: { en: "Terminated", hi: "समाप्त", gu: "સમાપ્ત" },
  // Quality / inspection
  SATISFACTORY: { en: "Satisfactory", hi: "संतोषजनक", gu: "સંતોષકારક" },
  NEEDS_ATTENTION: { en: "Needs Attention", hi: "ध्यान चाहिए", gu: "ધ્યાન જરૂરી" },
  UNSATISFACTORY: { en: "Unsatisfactory", hi: "असंतोषजनक", gu: "અસંતોષકારક" },
  REVIEWED: { en: "Reviewed", hi: "समीक्षित", gu: "સમીક્ષિત" },
  ACTION_REQUIRED: { en: "Action Required", hi: "कार्रवाई आवश्यक", gu: "કાર્યવાહી જરૂરી" },
  VERIFIED: { en: "Verified", hi: "सत्यापित", gu: "ચકાસાયેલ" },
  PENDING: { en: "Pending", hi: "लंबित", gu: "બાકી" },
  // Defect types
  POTHOLE: { en: "Pothole", hi: "गड्ढा", gu: "ખાડો" },
  CRACK: { en: "Crack", hi: "दरार", gu: "તિરાડ" },
  WATERLOGGING: { en: "Waterlogging", hi: "जलभराव", gu: "પાણી ભરાવો" },
  EDGE_DAMAGE: { en: "Edge Damage", hi: "किनारा क्षति", gu: "કિનારી નુકસાન" },
  SURFACE_DAMAGE: { en: "Surface Damage", hi: "सतह क्षति", gu: "સપાટી નુકસાન" },
  DRAINAGE_ISSUE: { en: "Drainage Issue", hi: "जल निकासी समस्या", gu: "ડ્રેનેજ સમસ્યા" },
  // Defect status
  SCHEDULED: { en: "Scheduled", hi: "निर्धारित", gu: "નિર્ધારિત" },
  RESOLVED: { en: "Resolved", hi: "हल किया गया", gu: "ઉકેલાયું" },
  // Maintenance status
  IN_PROGRESS: { en: "In Progress", hi: "प्रगति में", gu: "પ્રગતિમાં" },
  // Road types
  NATIONAL_HIGHWAY: { en: "National Highway", hi: "राष्ट्रीय राजमार्ग", gu: "રાષ્ટ્રીય ધોરીમાર્ગ" },
  STATE_HIGHWAY: { en: "State Highway", hi: "राज्य राजमार्ग", gu: "રાજ્ય ધોરીમાર્ગ" },
  MAJOR_DISTRICT_ROAD: { en: "Major District Road", hi: "प्रमुख जिला सड़क", gu: "મુખ્ય જિલ્લા માર્ગ" },
  URBAN_ROAD: { en: "Urban Road", hi: "शहरी सड़क", gu: "શહેરી માર્ગ" },
  RURAL_ROAD: { en: "Rural Road", hi: "ग्रामीण सड़क", gu: "ગ્રામીણ માર્ગ" },
  VILLAGE_ROAD: { en: "Village Road", hi: "गाँव की सड़क", gu: "ગામડાનો માર્ગ" },
};

export function enumLabel(value: string | null | undefined, locale: Locale): string {
  if (!value) return "—";
  const entry = LABELS[value];
  return entry?.[locale] ?? entry?.en ?? humanizeEnum(value);
}
